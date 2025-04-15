import { ItemView, WorkspaceLeaf, setIcon, TFile } from "obsidian";
import { CalloutFlashcard, extractCallouts } from "./utils";

export class FlashcardView extends ItemView {
  private flashcards: CalloutFlashcard[] = [];
  private source: TFile;
  private index: number = 0;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return "flashcard-view";
  }

  getDisplayText() {
    return "Flashcards";
  }

  getIcon() {
    return "gallery-vertical-end";
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
    this.updateProgressBar();
    this.updateButtons();
    this.addAction('undo-2', 'Return to File', (evt: MouseEvent) => {
      this.returnToFileView();
    });
  }

  setSource(source: TFile) {
    this.source = source;
  }

  private render() {
    this.setCard();
    this.updateProgressBar();
    this.updateButtons();
  }

  private updateProgressBar() {
    const container = this.containerEl.children[1];
    const progressBar = container.querySelector(".flashcard-progress-bar") as HTMLElement;

    if (progressBar) {
      const progress = ((this.index + 1) / this.flashcards.length) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }

  private updateButtons() {
    const container = this.containerEl.children[1];
    const previousButton = container.querySelector(".flashcard-previous-button");
    const nextButton = container.querySelector(".flashcard-next-button");
    if (this.index == 0) {
      previousButton?.setAttribute("aria-disabled", "true");
    } else {
      previousButton?.setAttribute("aria-disabled", "false");
    }
    if (this.index >= this.flashcards.length - 1) {
      console.log("Index: " + this.index + " Length: " + (this.flashcards.length - 1));
      nextButton?.setAttribute("aria-disabled", "true");
    } else {
      nextButton?.setAttribute("aria-disabled", "false");
    }
  }

  private setCard() {
    const container = this.containerEl.children[1];
    const cardFront = container.querySelector(".flashcard-front"); // Directly query the card div
    const cardBack = container.querySelector(".flashcard-back");
    if (cardFront && cardBack && this.flashcards.length > 0) {
      const fc = this.flashcards[this.index];
      const frontCardContent = cardFront.querySelector(".flashcard-content");
      const backCardContent = cardBack.querySelector(".flashcard-content");
      frontCardContent?.setText(fc.question);
      backCardContent?.setText(fc.answer);
    }
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    this.index = 0;

    const flashcardContainer = container.createDiv({ cls: "flashcard-container" });

    const card = flashcardContainer.createDiv({ cls: "flashcard" });
    const cardFront = card.createDiv({ cls: "flashcard-face flashcard-front" });
    const cardBack = card.createDiv({ cls: "flashcard-face flashcard-back" });
    const cardFrontTop = cardFront.createDiv({ cls: "flashcard-top" });
    const cardBackTop = cardBack.createDiv({ cls: "flashcard-top" });
    const cardFrontTitle = cardFrontTop.createEl("p", { cls: "flashcard-title", text: "Question" });
    const cardBackTitle = cardBackTop.createEl("p", { cls: "flashcard-title", text: "Answer" });
    const cardFrontContent = cardFront.createEl("p", { cls: "flashcard-content" });
    const cardBackContent = cardBack.createEl("p", { cls: "flashcard-content" });


    card.addEventListener("click", () => {
      this.setCard(); // Update the card based on the flipped state
      card.classList.toggle("flippedX"); // Add "flipped" class to trigger animation
    });

    const progressBarContainer = container.createDiv({ cls: "flashcard-progress-bar-container" });
    const progressBar = progressBarContainer.createEl("div", { cls: "flashcard-progress-bar" });

    // Update the progress bar's width based on the current index

    const navigationDiv = container.createDiv({ cls: "flashcard-navigation" });
    const previousButton = navigationDiv.createEl("span", { cls: "flashcard-previous-button clickable-icon" });
    const shuffleButton = navigationDiv.createEl("span", { cls: "clickable-icon" });
    const nextButton = navigationDiv.createEl("span", { cls: "flashcard-next-button clickable-icon" });

    setIcon(previousButton, "arrow-left");
    setIcon(shuffleButton, "shuffle");
    setIcon(nextButton, "arrow-right");


    previousButton.setAttribute("aria-disabled", "true");
    if (this.flashcards.length == 1) nextButton.setAttribute("aria-disabled", "true");

    progressBarContainer.addEventListener("click", (e: MouseEvent) => {
      const clickX = e.offsetX; // Get the click position
      const progress = (clickX / progressBarContainer.clientWidth); // Calculate the progress (0 to 1)
      this.index = Math.floor(progress * this.flashcards.length); // Set index based on click
      this.render();
    });

    previousButton.addEventListener("click", () => {
      if (this.index > 0) {
        this.index--;
        card.classList.remove("flippedX"); // Add "flipped" class to trigger animation
        this.updateProgressBar();
        this.updateButtons();
        card.classList.add("negFlippedY");
        setTimeout(() => {
          this.setCard();
          // Remove Y flip
          card.classList.remove("negFlippedY");
        }, 150);
      }
    });

    nextButton.addEventListener("click", () => {
      if (this.index < this.flashcards.length - 1) {
        this.index++;
        card.classList.remove("flippedX"); // Add "flipped" class to trigger animation
        this.updateProgressBar();
        this.updateButtons();
        card.classList.add("flippedY");
        setTimeout(() => {
          this.setCard();
          // Remove Y flip
          card.classList.remove("flippedY");
        }, 150);
      }
    });

    shuffleButton.addEventListener("click", () => {
      for (let i = this.flashcards.length - 1; i > 0; i--) {
        // Generate a random index between 0 and i
        const j = Math.floor(Math.random() * (i + 1));

        // Swap elements at i and j
        [this.flashcards[i], this.flashcards[j]] = [this.flashcards[j], this.flashcards[i]];
      }

      card.classList.remove("flipped"); // Add "flipped" class to trigger animation
      this.index = 0;
      this.render(); // Update the card
    });
  }
}

