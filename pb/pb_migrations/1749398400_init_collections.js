/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {

    // ── playlists ─────────────────────────────────────────────────────────
    const playlists = new Collection({
        name: "playlists",
        type: "base",
        fields: [
            {
                name: "user",
                type: "relation",
                required: true,
                collectionId: "_pb_users_auth_",
                cascadeDelete: true,
                maxSelect: 1,
            },
            {
                name: "name",
                type: "text",
                required: true,
            },
            {
                name: "source_url",
                type: "url",
                required: false,
            },
        ],
        listRule:   "user = @request.auth.id",
        viewRule:   "user = @request.auth.id",
        createRule: "@request.auth.id != ''",
        updateRule: "user = @request.auth.id",
        deleteRule: "user = @request.auth.id",
    })
    app.save(playlists)
    const playlistsId = app.findCollectionByNameOrId("playlists").id

    // ── favorites ─────────────────────────────────────────────────────────
    const favorites = new Collection({
        name: "favorites",
        type: "base",
        fields: [
            {
                name: "user",
                type: "relation",
                required: true,
                collectionId: "_pb_users_auth_",
                cascadeDelete: true,
                maxSelect: 1,
            },
            {
                name: "playlist",
                type: "relation",
                required: true,
                collectionId: playlistsId,
                cascadeDelete: true,
                maxSelect: 1,
            },
            {
                name: "channel_url",
                type: "text",
                required: true,
            },
            {
                name: "channel_name",
                type: "text",
                required: true,
            },
            {
                name: "channel_logo",
                type: "url",
                required: false,
            },
            {
                name: "channel_group",
                type: "text",
                required: false,
            },
        ],
        listRule:   "user = @request.auth.id",
        viewRule:   "user = @request.auth.id",
        createRule: "@request.auth.id != ''",
        updateRule: "user = @request.auth.id",
        deleteRule: "user = @request.auth.id",
    })
    app.save(favorites)

    // ── history ───────────────────────────────────────────────────────────
    const history = new Collection({
        name: "history",
        type: "base",
        fields: [
            {
                name: "user",
                type: "relation",
                required: true,
                collectionId: "_pb_users_auth_",
                cascadeDelete: true,
                maxSelect: 1,
            },
            {
                name: "playlist",
                type: "relation",
                required: true,
                collectionId: playlistsId,
                cascadeDelete: true,
                maxSelect: 1,
            },
            {
                name: "channel_url",
                type: "text",
                required: true,
            },
            {
                name: "channel_name",
                type: "text",
                required: true,
            },
            {
                name: "channel_logo",
                type: "url",
                required: false,
            },
            {
                name: "channel_group",
                type: "text",
                required: false,
            },
            {
                name: "watched_at",
                type: "date",
                required: true,
            },
        ],
        listRule:   "user = @request.auth.id",
        viewRule:   "user = @request.auth.id",
        createRule: "@request.auth.id != ''",
        updateRule: null,
        deleteRule: "user = @request.auth.id",
    })
    app.save(history)

}, (app) => {
    for (const name of ["history", "favorites", "playlists"]) {
        try {
            app.delete(app.findCollectionByNameOrId(name))
        } catch (_) {}
    }
})
