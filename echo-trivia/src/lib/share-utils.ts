// Utilities for generating shareable emoji scores

export function generateDailyShareText(
  score: number,
  totalQuestions: number,
  date: string
): string {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  // Generate emoji grid based on answers
  const emojis: string[] = [];
  for (let i = 0; i < totalQuestions; i++) {
    if (i < score) {
      emojis.push("🟩"); // Correct
    } else {
      emojis.push("🟥"); // Incorrect
    }
  }

  // Format the score card
  const shareText = `Trivia Wizard ${date}
${score}/${totalQuestions} (${percentage}%)

${emojis.join("")}

Play me: https://trivia-wizard-omega.vercel.app/`;

  return shareText;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      textArea.remove();
      return successful;
    }
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
}

