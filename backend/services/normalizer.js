function normalizeAxeViolations(violations) {
  return violations.flatMap(v =>
    v.nodes.map(node => ({
      source: "axe",
      ruleId: v.id,
      severity: v.impact || "unknown",
      description: v.help,
      helpUrl: v.helpUrl,
      selector: node.target?.join(", "),
      html: node.html,
      wcagTags: v.tags || []
    }))
  );
}

function normalizePa11yIssues(issues) {
  return issues.map(issue => ({
    source: "pa11y",
    ruleId: issue.code,
    severity: issue.type,
    description: issue.message,
    selector: issue.selector,
    html: issue.context,
    runner: issue.runner
  }));
}

module.exports = {
  normalizeAxeViolations,
  normalizePa11yIssues
};