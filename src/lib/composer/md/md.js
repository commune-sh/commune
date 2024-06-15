import { PUBLIC_BASE_URL } from '$env/static/public';
import MarkdownIt from 'markdown-it'
import MarkdownItEmoji from 'markdown-it-emoji'
import MarkdownItLinkAttributes from 'markdown-it-link-attributes'

export let md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  typographer: true
});


md.linkify.set({ fuzzyEmail: false })


md.linkify.add('@', {
    validate: function (text, pos, self) {
        var tail = text.slice(pos);

        if (!self.re.mention) {
            self.re.mention =  new RegExp(
                '^([a-zA-Z0-9_]){1,15}(?!_)(?=$|' + self.re.src_ZPCc + ')'
            );
        }
        if (self.re.mention.test(tail)) {
            if (pos >= 2 && tail[pos - 2] === '@') {
                return false;
            }
            return tail.match(self.re.mention)[0].length;
        }
        return 0;
    },

    normalize: function (match) {
        match.url = `${PUBLIC_BASE_URL}/@` + match.url.replace(/^@/, '');
    }
});

md.use(MarkdownItEmoji, { defs: {
  '1000': 'https://twemoji.maxcdn.com/2/72x72/1f4af.png',
}});

md.use(MarkdownItLinkAttributes, [
    {
        matcher(href) {
            return href.includes('@')
        },
        attrs: {
            class: "mention"
        },
    },
    {
        matcher(href) {
            return href.match(/^https?:\/\//);
        },
        attrs: {
            class: "external",
            target: "_blank",
            rel: "noopener",
        },
    },
    {
        matcher(href) {
            return href.startsWith("/");
        },
        attrs: {
            class: "absolute-link",
        },
    },
    {
        matcher(href) {
            return href.startsWith("/blue/");
        },
        attrs: {
            class: "link-that-contains-the-word-blue",
        },
    },
]);

export function newDefaultMD(opts) {
  if(opts?.emoji_defs) {
    md.use(MarkdownItEmoji, { defs: opts.emoji_defs});
  }
  return md;
}

export function newMD() {
  let md = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: true,
    typographer: true
  });
  return md;
}
