import { $prose } from '@milkdown/utils';
import { Plugin, PluginKey } from '@milkdown/prose/state';

const key = new PluginKey('url-transformer');

export default function urlTransformer(transformUrl: (url: string) => string) {
  return $prose(() => new Plugin({
    key,
    props: {
      markViews: {
        link: (mark) => {
          const dom = document.createElement('a');
          dom.href = transformUrl(mark.attrs.href);
          if (mark.attrs.title) dom.title = mark.attrs.title;
          return { dom, contentDOM: dom };
        },
      },
    },
  }));
}
