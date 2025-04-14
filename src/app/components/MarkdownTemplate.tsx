'use client';

export const defaultTemplate = `# Your Research Title

## Introduction
Start typing your research content here. This editor supports Markdown formatting.

## Methods
You can use **bold** and *italic* text.

## Results
- Create bullet points
- Add [links](https://example.com)

## Conclusion
Summarize your findings here.

## References
1. https://example.com/reference1
2. https://example.com/reference2`;

interface MarkdownTemplateProps {
  onApply: (template: string) => void;
}

export default function MarkdownTemplate({ onApply }: MarkdownTemplateProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
      <h3 className="text-lg font-medium mb-2">模板</h3>
      <p className="text-sm text-gray-600 mb-3">点击下方按钮应用研究论文模板</p>
      <button
        onClick={() => onApply(defaultTemplate)}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm transition-colors"
      >
        应用模板
      </button>
    </div>
  );
}