import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let vite, screens;
before(async () => {
  vite = await createServer({
    server: { middlewareMode: true, watch: null },
    appType: "custom",
  });
  const fixture = await vite.ssrLoadModule("/tests/frontend-fixture.jsx");
  screens = fixture.renderScreens();
});
after(async () => {
  await vite?.close();
});

test("separate login and signup pages preserve required fields", () => {
  assert.match(screens.login, /name="email"/);
  assert.match(screens.login, /name="password"/);
  assert.doesNotMatch(screens.login, /name="address"/);
  for (const field of ["name", "email", "address", "password"])
    assert.ok(screens.signup.includes(`name="${field}"`));
});
test("admin pages render statistics, sortable users and store directory", () => {
  assert.match(screens.adminUsers, /Submitted ratings/);
  assert.match(screens.adminUsers, /Alex Morgan/);
  assert.match(screens.adminUsers, /aria-sort="ascending"/);
  assert.match(screens.adminUsers, /View →/);
  assert.match(screens.adminStores, /The Green Corner Market/);
  assert.doesNotMatch(screens.adminStores, /rating-buttons/);
});
test("user and owner pages render role-specific ratings", () => {
  assert.match(screens.normalUser, /Your rating/);
  assert.match(screens.normalUser, /aria-pressed="true"/);
  assert.match(screens.owner, /Community feedback/);
  assert.match(screens.owner, /alex@example.com/);
  assert.match(screens.owner, /aria-sort="descending"/);
});
test("shared forms preserve password, creation and owner detail fields", () => {
  assert.match(screens.password, /name="currentPassword"/);
  assert.match(screens.password, /name="newPassword"/);
  assert.match(screens.newUser, /name="role"/);
  assert.match(screens.newStore, /name="ownerId"/);
  assert.match(screens.details, /STORE RATING/);
  assert.match(screens.details, /4.0/);
});
