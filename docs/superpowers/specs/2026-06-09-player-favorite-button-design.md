# Player Favorite Button — Design Spec

**Date:** 2026-06-09

## Summary

Add a favorite/unfavorite star button to the top-right of the player title bar, visible only to admin users. When a channel is playing, admin can toggle its favorite status directly from the player without going back to the channel list.

## Layout

The `.player-title` bar becomes a flex row with space-between:

```
[ logo | channel name ]          [ ★ ]
        (left)                  (right, admin only)
```

- Star is filled yellow (`#facc15`) when favorited, outline white when not.
- Clicking the star toggles favorite and updates state immediately (optimistic).

## State Management

Lift `favoriteMap` out of `ChannelList` and into `App.jsx`:

- `favoriteMap`: `{ [channelUrl]: pbRecordId }` — lives in `App.jsx`
- `refreshFavoriteMap()`: async, calls `api.getFavoriteMap()`
- `toggleFav(channel)`: add or remove from favorites, updates `favoriteMap` optimistically

## Component Changes

### `App.jsx`
- Add `favoriteMap` state, `refreshFavoriteMap`, `toggleFav`
- Load `favoriteMap` on mount (alongside playlists)
- Pass `favoriteMap` + `onToggleFav` to `ChannelList`
- Pass `isFavorited={!!favoriteMap[activeChannel?.url]}`, `onToggleFavorite={() => toggleFav(activeChannel)}`, `isAdmin` to `Player`

### `ChannelList.jsx`
- Remove internal `favoriteMap` state, `refreshFavoriteMap`, `toggleFav`
- Accept `favoriteMap` and `onToggleFav` as props
- `toggleFav` in ChannelList also handles removing channel from favorites view when unfavorited

### `Player.jsx`
- Accept `isFavorited`, `onToggleFavorite`, `isAdmin` as props
- Render star button in `.player-title` when `isAdmin` is true
- Same star SVG as used in ChannelList for visual consistency

### `App.css`
- Add `.player-fav-btn`: transparent background, no border, cursor pointer, flex-shrink 0, margin-left auto
- Hover: slight opacity change

## Constraints
- Favorite button only visible when `isAdmin === true`
- No loading/spinner needed — optimistic update is sufficient
- Reuse existing star SVG from ChannelList for consistency
