import { defineEcConfig } from 'astro-expressive-code';
import ecTwoSlash from 'expressive-code-twoslash';

export default defineEcConfig({
	tabWidth: 2,
	plugins: [ecTwoSlash()],
});
