"use client"
import { useEffect, useRef } from 'react';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import '@milkdown/crepe/theme/common/style.css';
import "./Editor.css"
import { pageContentUrlTransformer } from '@/lib/helpers';
import urlTransformer from '@/lib/milkdownUrlTransformer';

export interface EditorProps {
  pageId: string,
  initialContent: string,
  isReadOnly: boolean,
  onChange?: (content: string) => any
}

function EditorCore({ pageId, initialContent, isReadOnly, onChange }: EditorProps) {
  const crepeRef = useRef<Crepe>(null);

  useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: initialContent,
      features: {
        [Crepe.Feature.TopBar]: true,
        [Crepe.Feature.BlockEdit]: false,
      },
      featureConfigs: {
        [Crepe.Feature.Placeholder]: { text: 'Start writing here...' },
        [Crepe.Feature.ImageBlock]: {
          proxyDomURL: (url) => pageContentUrlTransformer(url)
        },
      },
    });

    crepe.editor.use(urlTransformer(pageContentUrlTransformer))
    crepe.setReadonly(isReadOnly);

    crepe.on((api) => {
      api.markdownUpdated((_ctx, markdown, prevMarkdown) => {
        if (markdown !== prevMarkdown) onChange?.(markdown);
      });
    });

    crepeRef.current = crepe;
    return crepe; // @milkdown/react calls .create()/.destroy() automatically
  }, [pageId]);

  useEffect(() => {
    crepeRef.current?.setReadonly(isReadOnly);
  }, [isReadOnly]);

  return <Milkdown />;
}

export default function Editor(props: EditorProps) {
  return (
    <MilkdownProvider>
      <EditorCore {...props} />
    </MilkdownProvider>
  );
}
