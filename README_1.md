<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1dPvQ1LtGBO0b2573l15JM_J8t-mRQ77-

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. (Optional) Configure Granite credentials in [.env.local](.env.local), e.g. `GRANITE_API_KEY`, `GRANITE_MODEL_ID`, or override the maximum token allowance if your deployment differs from the defaults.
3. Run the app:
   `npm run dev`

### Model configuration

- Default model: `granite-8b-code-instruct`
- Maximum tokens considered: `65,101` (≈ 260,404 characters)
- Reason: Keeps the generated Markdown compatible with the current Granite GGUF runtime while staying well below the 1,048,576-token hard limit.
