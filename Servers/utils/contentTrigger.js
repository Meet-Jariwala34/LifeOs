// backend/utils/contentTrigger.js
const axios = require('axios');

exports.autoTriggerContentTask = async (title, type, relatedProject = '') => {
  try {
    // 🎯 YOUR EXPLICIT n8n BACKGROUND STAGING WEBHOOK URL
    const N8N_STAGING_WEBHOOK = process.env.N8N_STAGING_WEBHOOK || 'http://localhost:5678/webhook-test/LifeOs_content_stage';

    // Fire-and-forget directly to n8n to handle LLM mapping, Cloudinary rendering, and DB document upserts
    axios.post(N8N_STAGING_WEBHOOK, {
      rawTitle: title,
      associatedType: type,
      projectName: relatedProject
    }).catch(err => console.error("❌ Failed to handoff asset to n8n staging cluster:", err.message));

    console.log(`📡 Background Pre-Generation Pipeline initialized for: "${title}"`);
  } catch (error) {
    console.error(`❌ Automated pre-generation pipeline fumbled:`, error.message);
  }
};