import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

const requiredRoutes = [
  'src/app/bunker/page.tsx',
  'src/app/bunker/auth/page.tsx',
  'src/app/bunker/admin/page.tsx',
];

test('required bunker routes exist', async () => {
  for (const routeFile of requiredRoutes) {
    await access(new URL(`../${routeFile}`, import.meta.url), constants.R_OK);
    assert.ok(true);
  }
});

test('admin page includes required tabs and play link', async () => {
  const adminPage = await readFile(new URL('../src/app/bunker/admin/page.tsx', import.meta.url), 'utf8');

  const requiredSnippets = [
    "'Характеристики'",
    "'Карты действий'",
    "'Сцены'",
    "'Фильтр чата'",
    "'Черный список'",
    "'Настройки'",
    "'Игра'",
    'href="/bunker"',
    'Играть',
  ];

  for (const snippet of requiredSnippets) {
    assert.ok(adminPage.includes(snippet), `Expected admin page to include: ${snippet}`);
  }
});
