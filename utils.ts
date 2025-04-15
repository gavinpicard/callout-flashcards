export interface CalloutFlashcard {
  question: string;   // e.g. "note", "warning", etc.
  answer: string; // full inner text of the callout
}

export function extractCallouts(content: string): CalloutFlashcard[] {

  const lines = content.split("\n");
  const callouts: CalloutFlashcard[] = [];

  let question = "";
  let answer = "";
  let inCallout = false;

  for (const line of lines) {
    if (line.startsWith("> [!card]-")) {
      if (inCallout) {
        callouts.push({
          question: question,
          answer: answer.trim()
        });
      }
      question = line.replace("> [!card]-", "") + "\n";
      inCallout = true;
    } else if (inCallout && line.startsWith("> ")) {
      answer += line.replace("> ", "") + "\n";
    } else {
      if (inCallout) {
        callouts.push({
          question: question,
          answer: answer.trim()
        });
      }
      inCallout = false;
      answer = "";
      question = "";
    }
  }

  if (inCallout) {
    callouts.push({
      question: question,
      answer: answer.trim()
    });
  }

  return callouts;
}
