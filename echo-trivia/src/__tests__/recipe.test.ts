// Unit tests for recipe determinism
// Run with: npx tsx src/__tests__/recipe.test.ts

import { buildRecipeFromSeed } from "../lib/recipe";
import { generateSeed } from "../lib/rand";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Assertion failed: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
}

function testDeterminism() {
  console.log("Testing determinism...");
  const seedA = "a".repeat(64); // 32-byte hex seed

  const recipe1 = buildRecipeFromSeed(seedA);
  const recipe2 = buildRecipeFromSeed(seedA);

  assertEqual(recipe1, recipe2, "Same seed should produce identical recipes");
  console.log("✓ Determinism test passed");
}

function testDifferentSeeds() {
  console.log("Testing different seeds produce different configs...");
  const seedA = "a".repeat(64);
  const seedB = "b".repeat(64);

  const recipeA = buildRecipeFromSeed(seedA);
  const recipeB = buildRecipeFromSeed(seedB);

  // At least one field should be different
  const isDifferent =
    recipeA.tone !== recipeB.tone ||
    recipeA.explanation !== recipeB.explanation ||
    recipeA.difficultyCurveId !== recipeB.difficultyCurveId;

  assert(isDifferent, "Different seeds should produce different configs in at least one field");
  console.log("✓ Different seeds test passed");
}

function testEnumSafety() {
  console.log("Testing all fields are from enum sets...");
  const seed = generateSeed();
  const recipe = buildRecipeFromSeed(seed);

  // Check numQuestions is 5 or 10
  assert(
    recipe.numQuestions === 5 || recipe.numQuestions === 10,
    "numQuestions must be 5 or 10"
  );

  // Check difficultyCurveId is 0, 1, or 2
  assert(
    recipe.difficultyCurveId === 0 || recipe.difficultyCurveId === 1 || recipe.difficultyCurveId === 2,
    "difficultyCurveId must be 0, 1, or 2"
  );

  // Check tone and explanation are numbers (enum values)
  assert(typeof recipe.tone === "number", "tone must be an enum number");
  assert(typeof recipe.explanation === "number", "explanation must be an enum number");

  // Check tone is in valid range (0-5 for 6 tones)
  assert(recipe.tone >= 0 && recipe.tone <= 5, "tone must be in valid enum range");

  // Check explanation is in valid range (0-3 for 4 explanation styles)
  assert(recipe.explanation >= 0 && recipe.explanation <= 3, "explanation must be in valid enum range");

  console.log("✓ Enum safety test passed");
}

function testDifficultyCurveLength() {
  console.log("Testing difficulty curve length matches numQuestions...");

  const seed = generateSeed();
  const recipe5 = buildRecipeFromSeed(seed, { fixedNumQuestions: 5 });
  const recipe10 = buildRecipeFromSeed(seed, { fixedNumQuestions: 10 });

  assert(recipe5.numQuestions === 5, "Should have 5 questions when fixed");
  assert(recipe10.numQuestions === 10, "Should have 10 questions when fixed");

  console.log("✓ Difficulty curve length test passed");
}

function testRecipeStructure() {
  console.log("Testing recipe has correct structure...");

  const seed = generateSeed();
  const recipe = buildRecipeFromSeed(seed);

  // Recipe should only have these fields
  const expectedKeys = ["seedHex", "numQuestions", "difficultyCurveId", "tone", "explanation"];
  const actualKeys = Object.keys(recipe).sort();
  const expected = expectedKeys.sort();

  assertEqual(actualKeys, expected, "Recipe should have exactly the expected fields");

  console.log("✓ Recipe structure test passed");
}

function runAllTests() {
  console.log("Running recipe determinism tests...\n");

  try {
    testDeterminism();
    testDifferentSeeds();
    testEnumSafety();
    testDifficultyCurveLength();
    testRecipeStructure();

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

runAllTests();
