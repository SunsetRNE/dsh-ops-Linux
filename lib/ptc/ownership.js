import { ownScopes } from '../scoped-ownership.js';
export const ownPtcScopes = (ctx, changed) => ownScopes(ctx, 'ptc', changed);
