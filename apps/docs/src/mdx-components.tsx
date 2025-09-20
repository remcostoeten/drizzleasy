import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { InteractiveFiles, InteractiveFile } from '@/components/interactive-files';

// Use this function to get MDX components, wrapping code blocks with the enhanced CodeBlock UI
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    pre: ({ ref: _ref, ...props }) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    Files: InteractiveFiles,
    File: InteractiveFile,
    ...components,
  };
}
