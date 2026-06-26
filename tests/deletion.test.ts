import test from 'node:test';
import assert from 'node:assert/strict';

import { PropertyManagementApp, createInMemoryStore } from '../src/app/index.ts';

test('can delete an owner from the store', () => {
  const app = new PropertyManagementApp(createInMemoryStore());

  const owner = app.createOwner({
    reference: 'OWN-DELETE-TEST',
    firstName: 'Test',
    surname: 'User',
  });

  assert.equal(app.listOwners().length, 1);
  assert.equal(app.listOwners()[0].id, owner.id);

  app.deleteOwner(owner.id);

  assert.equal(app.listOwners().length, 0);
});

test('deleting a non-existent owner does nothing', () => {
  const app = new PropertyManagementApp(createInMemoryStore());

  app.createOwner({
    reference: 'OWN-KEEP',
    firstName: 'Keep',
    surname: 'Me',
  });

  assert.equal(app.listOwners().length, 1);

  app.deleteOwner('non-existent-id');

  assert.equal(app.listOwners().length, 1);
});
