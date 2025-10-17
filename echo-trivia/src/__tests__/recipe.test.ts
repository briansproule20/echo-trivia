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
    recipeA.era !== recipeB.era ||
    recipeA.region !== recipeB.region ||
    recipeA.difficultyCurveId !== recipeB.difficultyCurveId ||
    JSON.stringify(recipeA.categoryMix) !== JSON.stringify(recipeB.categoryMix);

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

  // Check all arrays are non-empty
  assert(recipe.categoryMix.length > 0, "categoryMix must not be empty");
  assert(recipe.questionTypes.length > 0, "questionTypes must not be empty");
  assert(recipe.distractors.length === 2, "distractors must have exactly 2 elements");

  // Check tone, era, region, explanation are numbers (enum values)
  assert(typeof recipe.tone === "number", "tone must be an enum number");
  assert(typeof recipe.era === "number", "era must be an enum number");
  assert(typeof recipe.region === "number", "region must be an enum number");
  assert(typeof recipe.explanation === "number", "explanation must be an enum number");

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

function testCategoryMixSize() {
  console.log("Testing category mix size is between 4-6...");

  for (let i = 0; i < 10; i++) {
    const seed = generateSeed();
    const recipe = buildRecipeFromSeed(seed);

    assert(
      recipe.categoryMix.length >= 4 && recipe.categoryMix.length <= 6,
      `categoryMix length should be 4-6, got ${recipe.categoryMix.length}`
    );
  }

  console.log("✓ Category mix size test passed");
}

function testQuestionTypesSize() {
  console.log("Testing question types size is between 2-3...");

  for (let i = 0; i < 10; i++) {
    const seed = generateSeed();
    const recipe = buildRecipeFromSeed(seed);

    assert(
      recipe.questionTypes.length >= 2 && recipe.questionTypes.length <= 3,
      `questionTypes length should be 2-3, got ${recipe.questionTypes.length}`
    );
  }

  console.log("✓ Question types size test passed");
}

function runAllTests() {
  console.log("Running recipe determinism tests...\n");

  try {
    testDeterminism();
    testDifferentSeeds();
    testEnumSafety();
    testDifficultyCurveLength();
    testCategoryMixSize();
    testQuestionTypesSize();

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

runAllTests();
