import { NarrativeResult, LogSummary } from '../types';

export function formatNarrativeMarkdown(
  narrative: NarrativeResult,
  summary: LogSummary,
  modelName: string = 'qwen2.5:3b'
): string {
  const timestamp = new Date().toISOString();

  let md = `# ${narrative.title}\n\n`;
  md += `*GhostTrace Narrative Chronicle*\n`;
  md += `**Mode:** ${narrative.selected_mode} | **Model:** ${modelName} | **Generated:** ${timestamp}\n\n`;
  md += `> [!NOTE]\n`;
  md += `> **Privacy & Grounding:** This narrative was synthesized through the configured Ollama endpoint using an open-weight model. Check your GhostTrace endpoint settings to confirm where inference ran.\n`;
  md += `> Observed technical events are derived from deterministic log parsing. Creative interpretations are explicitly demarcated below.\n\n`;

  md += `## 📜 Opening\n\n`;
  md += `*${narrative.opening}*\n\n`;

  md += `## 📖 The Narrative\n\n`;
  md += `${narrative.narrative}\n\n`;

  md += `> "${narrative.closing_line}"\n\n`;

  md += `## 🔍 Deterministic Summary Metrics\n\n`;
  md += `- **Total Lines Processed:** ${summary.total_lines}\n`;
  md += `- **Events Extracted:** ${summary.extracted_events_count}\n`;
  md += `- **Errors Detected:** ${summary.errors_count}\n`;
  md += `- **Warnings Detected:** ${summary.warnings_count}\n`;
  md += `- **Commands Identified:** ${summary.commands_count}\n`;
  if (summary.time_range) {
    md += `- **Time Range:** ${summary.time_range}\n`;
  }
  if (summary.detected_patterns && summary.detected_patterns.length > 0) {
    md += `- **Detected Patterns:**\n`;
    for (const pat of summary.detected_patterns) {
      md += `  - ${pat}\n`;
    }
  }
  md += `\n`;

  if (narrative.key_events && narrative.key_events.length > 0) {
    md += `## 📍 Grounded Key Events\n\n`;
    md += `| ID | Event | Log Evidence | Line | Nature | Interpretation |\n`;
    md += `| :--- | :--- | :--- | :---: | :---: | :--- |\n`;
    for (const ke of narrative.key_events) {
      const lineStr = ke.line_reference !== null ? `#${ke.line_reference}` : 'N/A';
      const natureStr = ke.is_creative ? '✨ Creative' : '🔬 Factual';
      const safeEv = ke.log_evidence.replace(/\|/g, '\\|').replace(/\n/g, ' ');
      const safeInterp = ke.interpretation.replace(/\|/g, '\\|');
      md += `| \`${ke.event_id}\` | **${ke.title}** | \`${safeEv}\` | ${lineStr} | ${natureStr} | ${safeInterp} |\n`;
    }
    md += `\n`;
  }

  if (narrative.creative_interpretations && narrative.creative_interpretations.length > 0) {
    md += `## 🎭 Creative Interpretations vs Factual Evidence\n\n`;
    md += `| Story Aspect | Factual Log Basis | Creative Metaphor Layer |\n`;
    md += `| :--- | :--- | :--- |\n`;
    for (const ci of narrative.creative_interpretations) {
      const safeFact = ci.factual_basis.replace(/\|/g, '\\|');
      const safeLayer = ci.creative_layer.replace(/\|/g, '\\|');
      md += `| **${ci.aspect}** | ${safeFact} | ${safeLayer} |\n`;
    }
    md += `\n`;
  }

  if (narrative.uncertainties && narrative.uncertainties.length > 0) {
    md += `## ❓ Unresolved Technical Uncertainties\n\n`;
    for (const unc of narrative.uncertainties) {
      md += `- ${unc}\n`;
    }
    md += `\n`;
  }

  md += `---\n`;
  md += `*GhostTrace — Hacktoberfest 2026: Ghost in the Machine*\n`;
  return md;
}

export function downloadMarkdownFile(content: string, filename: string = 'ghosttrace-narrative.md') {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
