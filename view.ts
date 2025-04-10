import { ItemView, WorkspaceLeaf, setIcon, TFile } from "obsidian";
import { CalloutFlashcard, extractCallouts } from "./utils";

export class FlashcardView extends ItemView {
  private flashcards: CalloutFlashcard[] = [];
  private source: TFile;
  private index: number = 0;
  private flipped: boolean = false;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return "flashcard-view";
  }

  getDisplayText() {
    return "Flashcards";
  }

  getSource() {
    return this.source;
  }

  async returnToFileView() {
    if (this.source) {
      await this.leaf.openFile(this.source);
    }
  }

  setFlashcards(flashcards: CalloutFlashcard[]) {
    this.flashcards = flashcards;
    this.setCard();
    this.addAction('undo-2', 'Return to File', (evt: MouseEvent) => {
      this.returnToFileView();
    });
  }

  setSource(source: TFile) {
    this.source = source;
  }

  private setCard() {
    const container = this.containerEl.children[1];
    const card = container.querySelector(".flashcard"); // Directly query the card div
    if (card && this.flashcards.length > 0) {
      const fc = this.flashcards[this.index];
      const textEl = card.querySelector("p");
      if (textEl) {
        if (this.flipped) {
          textEl.innerText = fc.answer; // Show the answer on the back of the card
        } else {
          textEl.innerText = fc.question; // Show the question on the front of the card
        }
      }
    }
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();

    const card = container.createDiv({ cls: "flashcard" });
    const textEl = card.createEl("p", { text: "" });

    card.addEventListener("click", () => {
      this.flipped = !this.flipped; // Toggle the flipped state
      this.setCard(); // Update the card based on the flipped state
    });

    const navigationDiv = container.createDiv({ cls: "flashcard-navigation" });
    const previousButton = navigationDiv.createEl("span", { cls: "clickable-icon" });
    setIcon(previousButton, "arrow-left");
    const nextButton = navigationDiv.createEl("span", { cls: "clickable-icon" });
    setIcon(nextButton, "arrow-right");


    previousButton.addEventListener("click", () => {
      if (this.index > 0) {
        this.index--;
        this.flipped = false;
        this.setCard(); // Update the card
      }
    });

    nextButton.addEventListener("click", () => {
      if (this.index < this.flashcards.length - 1) {
        this.index++;
        this.flipped = false;
        this.setCard(); // Update the card
      }
    });
  }
}

