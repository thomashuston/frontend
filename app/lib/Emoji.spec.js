/* global describe, it, expect, jest */
import Emoji from './Emoji';

function mockLoadWebpackedCatalogue(catalogue) {
  process.env.EMOJI_HOST = 'emoji-host.com';

  const loader = require('../../webpack/emoji-loader');
  const emojis = require(`../../vendor/emojis/img-${catalogue}-64.json`);
  const webpack = {};

  return eval(loader.call(webpack, emojis)); // eslint-disable-line no-eval
}

jest.mock('../emoji/buildkite', () => mockLoadWebpackedCatalogue('buildkite'));
jest.mock('../emoji/apple', () => mockLoadWebpackedCatalogue('apple'));

const SHORTCODE_EMOJI_TESTS = [
  ':buildkite:',
  ':wave::skin-tone-3:',
  ':woman-woman-girl:',
  'String with :rocket:'
];

const ESCAPED_SHORTCODE_EMOJI_TESTS = [
  'String with \\:rocket\\:',
  'arn\\:aws\\:s3:::bucket'
];

const UNICODE_EMOJI_TESTS = [
  '👋🏿',
  '👍 :buildkite:',
  '™',
  '👩‍👩‍👧',
  '👩🏻‍🏫',
  '🇦🇺💜🇨🇦',
  '⛄',
  '💩 in the 💨',
  '©️©',
  '🅱️epis'
];

describe('Emoji', () => {
  describe('parse', () => {
    describe('converts emoji shortcodes', () => {
      SHORTCODE_EMOJI_TESTS.forEach((testcase) => {
        it(`"${testcase}"`, () => {
          expect(Emoji.parse(testcase)).toMatchSnapshot();
        });
      });
    });

    describe('ignores escaped shortcodes', () => {
      ESCAPED_SHORTCODE_EMOJI_TESTS.forEach((testcase) => {
        it(`"${testcase}"`, () => {
          expect(Emoji.parse(testcase)).toMatchSnapshot();
        });
      });
    });

    describe('leaves Unicode emoji alone', () => {
      UNICODE_EMOJI_TESTS.forEach((testcase) => {
        it(`"${testcase}"`, () => {
          expect(Emoji.parse(testcase)).toMatchSnapshot();
        });
      });
    });

    it('escapes other HTML by default', () => {
      expect(Emoji.parse(":tada: <strong>This be strong...</strong>")).toMatchSnapshot();
    });

    it('allows you to turn off HTML escaping', () => {
      expect(Emoji.parse(":tada: <strong>This be strong...</strong>", { escape: false })).toMatchSnapshot();
    });
  });
});
