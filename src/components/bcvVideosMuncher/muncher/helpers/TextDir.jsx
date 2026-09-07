import { useDetectDir } from "font-detect-rhl";

/**
  Character ratioThreshold = RTL : (LTR + RTL)
    - Default: 0.3

  HTML:
    - Comprehensive markup regex exclusion is applied excluding html code, in addition to neutral direction characters
      - Thus a higher ratioThreshold is utilized

  Text (with no markup):
    - No regex exclusion is applied aside from neutral direction characters
    - Precise identification of text direction excluding neutral direction characters
      Using a ratioThreshold of 0.24 to allow for pre-populated LTR book code: 1 RTL ÷ (1 RTL + 3 LTR) = .25

  USFM / MD:
    - Markup regex exclusion is applied, in addition to neutral direction characters
    - A lower ratioThreshold allows for the possibility that some LTR markup text could be missed by markup regex exclusion.
    - Note that at new document headers that contain the following usfm underneath mean 18 LTR Book Code characters from the start!
        \id TIT
        \toc1 TIT
        \toc2 TIT
        \toc3 TIT
        \h TIT
        \mt TIT

  Unspecified text:
    - No regex exclusion is applied.
    - A lower ratioThreshold allows for the possibility that unspecified text type could contain some LTR markup character that should be excluded from consideration.
*/
function TextDir(content, type) {
  const htmlMarkupScope = {
    regex: [/<[^>]+>/gm], // Remove all html code
  };

  const mdMarkupScope = {
    regex: [
      /^#{1,}|((?<=.[\r?\n|\r])^)={1,}|^ *>{1,}( >)* #*=*(\d+\.)*|^ *\d+\.|^ *\+|(_|\*|~|\|)|[\[|!\[]|(\.*?\]\((.*?)\))/gm,
    ], // headings | alternate heading | block quotes and inside headings and inside ordered lists | ordered lists | unordered + lists | bold, italics, strike, horizontal rules, tables (and any other occurrence of _, *, ~, or | (not capturing - as it is in neutralScope) | link/image
  };

  /** Adds bidi underscore (_) because of "empty chapters and verses" use (html and text)
      Temporarily excludes:
        this phrase - Stories That Changed the World
        open parenthesis - (
        close parenthesis - )
        LTR numbers - 0123456789
        colon - : */
  const neutralScope = {
    regex: [
      /\.|-|_|\(|\)|Stories That Changed the World|\d|:|\r?\n|\r|[\u{000C}\u{0020}\u{00A0}\u{1680}\u{180E}\u{2000}-\u{200F}\u{2028}\u{202F}\u{205F}\u{2060}\u{2420}\u{2422}\u{2423}\u{2800}\u{3000}\u{3164}\u{FEFF}]/gmu,
    ],
  };

  const useDetectDirHtmlProps = {
    text: content,
    ratioThreshold: 0.51,
    isMarkup: true,
    markupScope: htmlMarkupScope,
    neutralScope: neutralScope,
  };
  const useDetectDirUsfmProps = {
    text: content,
    ratioThreshold: 0.24,
    isMarkup: true,
  }; // Default usfm markup regex is in use.
  const useDetectDirMdProps = {
    text: content,
    isMarkup: true,
    markupScope: mdMarkupScope,
  };
  const useDetectDirTextProps = {
    text: content,
    ratioThreshold: 0.24,
    isMarkup: false,
    neutralScope: neutralScope,
  };
  const useDetectDirUnspecifiedType = { text: content, isMarkup: true };

  let useDetectDirProps;

  switch (type) {
    case "html":
      useDetectDirProps = useDetectDirHtmlProps;
      break;
    case "usfm":
      useDetectDirProps = useDetectDirUsfmProps;
      break;
    case "md":
      useDetectDirProps = useDetectDirMdProps;
      break;
    case "text":
      useDetectDirProps = useDetectDirTextProps;
      break;
    default:
      useDetectDirProps = useDetectDirUnspecifiedType;
  }
  const textDir = useDetectDir(useDetectDirProps);

  return textDir;
}

export default TextDir;
