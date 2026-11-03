import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import test from 'node:test';

async function publicFiles(directory = new URL('../', import.meta.url), prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['test', 'node_modules', '.git', '.DS_Store'].includes(entry.name)) continue;
    const path = `${prefix}${entry.name}`;
    if (entry.isDirectory()) files.push(...await publicFiles(new URL(`${entry.name}/`, directory), `${path}/`));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

test('public documentation uses Croc branding without changing SDK contracts', async () => {
  for (const file of await publicFiles()) {
    assert.doesNotMatch(file, /Rocky/i, file);
    if (/\.(?:md|json|ya?ml|html|txt|svg)$/i.test(file)) {
      const source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
      assert.doesNotMatch(source, /Rocky/i, file);
    }
  }

  const config = await readFile(new URL('../gitbook-docs.yaml', import.meta.url), 'utf8');
  assert.match(config, /title: Croc Wallet Docs/);

  const install = await readFile(new URL('../developers/install-sdk.md', import.meta.url), 'utf8');
  assert.match(install, /croc-wallet-dapp-sdk-1\.0\.0\.tgz/);
  assert.match(install, /crocWallet/);
  assert.match(install, /CrocWalletError/);
  assert.doesNotMatch(install, /@rocky-wallet\/dapp-sdk/);
});

test('public images match the OCR-reviewed approval baseline', async () => {
  const baseline = JSON.parse(await readFile(new URL('./image-baseline.json', import.meta.url), 'utf8'));
  const images = (await publicFiles()).filter(file => /\.(?:png|jpe?g|webp)$/i.test(file));
  assert.deepEqual(images.sort(), baseline.images.map(row => row.file).sort());
  for (const row of baseline.images) {
    const bytes = await readFile(new URL(`../${row.file}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), row.sha256,
      `${row.file}: image changed; repeat OCR and visual review before approving`);
    assert.equal(row.retired_brand_matches, 0, row.file);
  }
});
