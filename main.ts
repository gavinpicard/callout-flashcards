import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, addIcon } from 'obsidian';
import { FlashcardView } from "./view";
import { extractCallouts } from "./utils";


export const VIEW_TYPE_FLASHCARD = "flashcard-view";
// Remember to rename these classes and interfaces!

interface CalloutFlashcardsSettings {
  mySetting: string;
  customCssColor: string;
}

const DEFAULT_SETTINGS: CalloutFlashcardsSettings = {
  mySetting: "card",
  customCssColor: "#ff0000"
}

export default class CalloutFlashcards extends Plugin {
  settings: CalloutFlashcardsSettings;

  async onload() {
    await this.loadSettings();
    this.applyCustomStyles();


    const ribbonIconEl = this.addRibbonIcon('gallery-vertical-end', 'Callout Flashcards', (evt: MouseEvent) => {
      // Called when the user clicks the icon.
      this.activateFlashcardView();
    });
    // Perform additional things with the ribbon
    ribbonIconEl.addClass('my-plugin-ribbon-class');

    // This adds a status bar item to the bottom of the app. Does not work on mobile apps.

    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: 'open-flashcard-view',
      name: 'Open Flashcard View',
      callback: () => {
        this.activateFlashcardView();
      }
    });
    // This adds an editor command that can perform some operation on the current editor instance

    // This adds a complex command that can check whether the current state of the app allows execution of the command
    /*
    this.addCommand({
      id: 'open-sample-modal-complex',
      name: 'Open sample modal (complex)',
      checkCallback: (checking: boolean) => {
        // Conditions to check
        const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (markdownView) {
          // If checking is true, we're simply "checking" if the command can be run.
          // If checking is false, then we want to actually perform the operation.
          if (!checking) {
            new SampleModal(this.app).open();
          }

          // This command will only show up in Command Palette when the check function returns true
          return true;
        }
      }
    });*/

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new CalloutFlashcardsSettingTab(this.app, this));

    // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
    // Using this function will automatically remove the event listener when this plugin is disabled.
    this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
      console.log('click', evt);
    });

    // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
    this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

    this.registerView(
      VIEW_TYPE_FLASHCARD,
      (leaf) => new FlashcardView(leaf)
    );
  }

  onunload() {
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.applyCustomStyles();
  }

  async activateFlashcardView() {
    const { workspace } = this.app;

    const activeLeaf = workspace.getMostRecentLeaf();
    if (!activeLeaf) return;

    if (activeLeaf?.getViewState().type == "flashcard-view") {
      const currView = activeLeaf.view as FlashcardView;
      await activeLeaf.openFile(currView.getSource());
      return;
    }

    const leaf = workspace.getLeaf();
    if (!leaf) return;

    const file = workspace.getActiveFile();
    if (!file) return;

    const content = await this.app.vault.read(file);
    const flashcards = extractCallouts(content);

    await leaf.setViewState({
      type: "flashcard-view",
      active: true
    })

    const view = leaf.view;
    if (view instanceof FlashcardView) {
      view.setFlashcards(flashcards);
      view.setSource(file);
    }

    workspace.revealLeaf(leaf);
  }

  applyCustomStyles() {
    const styleId = "callout-flashcard-style";

    // Remove old style element if it exists
    const oldStyle = document.getElementById(styleId);
    if (oldStyle) oldStyle.remove();

    // Create new style element
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `  
    .callout[data-callout="card"] {
      --callout-color: ${hexToRgbString(this.settings.customCssColor)};
    }`
    document.head.appendChild(style);
  }
}

/*
class SampleModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const {contentEl} = this;
    contentEl.setText('Woah!');
  }

  onClose() {
    const {contentEl} = this;
    contentEl.empty();
  }
}
*/

function hexToRgbString(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

class CalloutFlashcardsSettingTab extends PluginSettingTab {
  plugin: CalloutFlashcards;

  constructor(app: App, plugin: CalloutFlashcards) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Callout Keyword")
      .setDesc("Set the name of flashcard callouts, as in what goes inside -> [!card]")
      .addText(text => 
        text.setPlaceholder("card")
          .setValue(this.plugin.settings.mySetting)
          .onChange(async (value) => {
            this.plugin.settings.mySetting = value;
            await this.plugin.saveSettings();
          }));

    new Setting(containerEl)
      .setName("Callout Color")
      .setDesc("Set the CSS color for the flashcard callouts")
      .addText(text => {
        text.inputEl.type = "color"; // this turns it into a color picker
        text.setValue(this.plugin.settings.customCssColor)
          .onChange(async (value) => {
            this.plugin.settings.customCssColor = value;
            await this.plugin.saveSettings();
          });
      });
  }
}

