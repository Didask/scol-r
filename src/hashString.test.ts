import { hashString } from "./hashString";

test("hashString", async () => {
  const hashedFoo = await hashString("foo");
  const hashedBar = await hashString("bar");
  const hashedFooAgain = await hashString("foo");

  // Hashed values should be different than the original strings
  expect(hashedFoo).not.toBe("foo");
  expect(hashedBar).not.toBe("bar");

  // Hashed values should be different for different strings
  expect(hashedFoo).not.toBe(hashedBar);

  // Hashed values multiple times should be the same
  expect(hashedFoo).toBe(hashedFooAgain);
});
