#!/usr/bin/env node

/**
 * KAVRA Shopify Store Product Importer
 * Reads kavra_sample_products.csv and creates products in Shopify using
 * either Shopify CLI (`shopify store execute`) or a direct Admin API Token.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// Load local .env if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const STORE = process.env.SHOPIFY_STORE || 'your-store.myshopify.com';
const TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';
const CSV_FILE = path.resolve(__dirname, '../kavra_sample_products.csv');

// Parse CSV manually respecting quoted fields and commas
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  function parseLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }
  return rows;
}

// Group variants by Handle
function groupProducts(rows) {
  const products = new Map();
  for (const row of rows) {
    const handle = row['Handle'];
    if (!handle) continue;

    if (!products.has(handle)) {
      products.set(handle, {
        handle,
        title: row['Title'] || handle,
        bodyHtml: row['Body (HTML)'] || '',
        vendor: row['Vendor'] || 'KAVRA',
        productType: row['Type'] || 'Deri',
        tags: (row['Tags'] || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        imageSrc: row['Image Src'] || '',
        optionName: row['Option1 Name'] || 'Beden',
        variants: [],
      });
    }

    const prod = products.get(handle);
    const varValue = row['Option1 Value'] || 'Tek Beden';
    prod.variants.push({
      optionValue: varValue,
      price: row['Variant Price'] || '0.00',
      compareAtPrice: row['Variant Compare At Price'] || null,
      sku: row['Variant SKU'] || '',
    });
  }
  return Array.from(products.values());
}

// Execute GraphQL query either via Shopify CLI or direct Fetch
async function executeGraphQL(query, variables) {
  if (TOKEN) {
    const url = `https://${STORE}/admin/api/2024-07/graphql.json`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });
    return await res.json();
  }

  const args = [
    'store',
    'execute',
    '--store',
    STORE,
    '--query',
    query,
    '--variables',
    JSON.stringify(variables),
    '--allow-mutations',
    '--json',
  ];

  try {
    const stdout = execFileSync('shopify', args, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Filter out CLI progress JSON log events
    const lines = stdout.split('\n');
    const payload = lines
      .filter((l) => !l.startsWith('{"type":"progress"'))
      .join('\n')
      .trim();
    return JSON.parse(payload);
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : '';
    const stdout = err.stdout ? err.stdout.toString() : '';
    throw new Error(stderr || stdout || err.message);
  }
}

const PRODUCT_SET_MUTATION = `
mutation CreateOrUpdateProduct($input: ProductSetInput!) {
  productSet(input: $input) {
    product {
      id
      title
      handle
    }
    userErrors {
      field
      message
    }
  }
}
`;

async function main() {
  console.log(`\n==================================================`);
  console.log(`  KAVRA Shopify Product Importer`);
  console.log(`  Target Store: ${STORE}`);
  console.log(`  Auth Mode: ${TOKEN ? 'Direct Admin Token' : 'Shopify CLI Session'}`);
  console.log(`==================================================\n`);

  if (!fs.existsSync(CSV_FILE)) {
    console.error(`Error: CSV file not found at ${CSV_FILE}`);
    process.exit(1);
  }

  const rows = parseCSV(CSV_FILE);
  const products = groupProducts(rows);
  console.log(`Parsed ${products.length} unique products from CSV.\n`);

  let successCount = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    process.stdout.write(`[${i + 1}/${products.length}] Importing "${p.title}"... `);

    function buildInput(includeFiles = true) {
      const input = {
        title: p.title,
        descriptionHtml: p.bodyHtml,
        vendor: p.vendor,
        productType: p.productType,
        tags: p.tags,
        status: 'ACTIVE',
        productOptions: [
          {
            name: p.optionName,
            values: p.variants.map((v) => ({ name: v.optionValue })),
          },
        ],
        variants: p.variants.map((v) => ({
          optionValues: [{ optionName: p.optionName, name: v.optionValue }],
          price: parseFloat(v.price),
          compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : undefined,
          sku: v.sku || undefined,
        })),
      };

      if (includeFiles && p.imageSrc) {
        input.files = [
          {
            originalSource: p.imageSrc,
            contentType: 'IMAGE',
          },
        ];
      }
      return input;
    }

    try {
      let result = await executeGraphQL(PRODUCT_SET_MUTATION, { input: buildInput(true) });

      // Normalize result: shopify CLI unwraps "data", fetch wraps in "data"
      let payload = result.data ? result.data.productSet : result.productSet;

      // Check if remote files are blocked on trial accounts
      const userErrors = (payload && payload.userErrors) || [];
      const isTrialFileError = userErrors.some(
        (e) => e.message && e.message.includes('The file is not supported on trial accounts')
      );

      if (isTrialFileError) {
        // Retry immediately without files to bypass trial limit
        result = await executeGraphQL(PRODUCT_SET_MUTATION, { input: buildInput(false) });
        payload = result.data ? result.data.productSet : result.productSet;
      }

      if (payload && payload.product) {
        const fileNote = isTrialFileError
          ? ' (product & variants created; images require manual upload or paid plan)'
          : '';
        console.log(`Success! ID: ${payload.product.id}${fileNote}`);
        successCount++;
      } else {
        const errs = (payload && payload.userErrors) || result.errors || [];
        const msg = errs.map((e) => e.message).join(', ') || JSON.stringify(result);
        console.log(`Failed: ${msg}`);
      }
    } catch (err) {
      console.log(`Error: ${err.message}`);
      if (err.message.includes('No stored app authentication found')) {
        console.log(`\nHint: Run "make auth" first.\n`);
        process.exit(1);
      }
    }
  }

  console.log(
    `\nImport completed: ${successCount}/${products.length} products created successfully.`
  );
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
