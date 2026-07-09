"use client";
import { useEffect, useRef } from 'react';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import '@milkdown/crepe/theme/common/style.css';
import "./Editor.css"
import urlTransformer from '@/lib/milkdownUrlTransformer';
import { pageContentUrlTransformer } from '@/lib/helpers';

export interface EditorProps {
  pageSlug: string
  initialContent: string
  isReadOnly: boolean
  onChange?: (content: string) => unknown
  baseUrl: string
}

function EditorCore({ pageSlug, initialContent, isReadOnly, onChange, baseUrl }: EditorProps) {
  const crepeRef = useRef<Crepe>(null);
  const appUrlTransformer = (url: string) => pageContentUrlTransformer(url, { pageSlug, baseUrl })

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
          proxyDomURL: appUrlTransformer
        },
      },
    });

    crepe.editor.use(urlTransformer(appUrlTransformer))
    crepe.setReadonly(isReadOnly);

    crepe.on((api) => {
      api.markdownUpdated((_ctx, markdown, prevMarkdown) => {
        if (markdown !== prevMarkdown) onChange?.(markdown);
      });
    });

    crepeRef.current = crepe;
    return crepe; // @milkdown/react calls .create()/.destroy() automatically
  }, [pageSlug]);

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
