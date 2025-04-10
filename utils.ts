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
    if (line.startsWith("> [!flashcard]-")) {
      if (inCallout) {
        callouts.push({
          question: question,
          answer: answer.trim()
        });
      }
      question = line.replace("> [!flashcard]-", "") + "\n";
      inCallout = true;
      console.log("1");
    } else if (inCallout && line.startsWith("> ")) {
      answer += line.replace("> ", "") + "\n";
      console.log("please");
    } else {
      if (inCallout) {
        callouts.push({
          question: question,
          answer: answer.trim()
        });
      }
      console.log("2");
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
