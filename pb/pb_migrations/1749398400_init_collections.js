/// <reference path="../pb_data/types.d.ts" />

migrate((db) => {
    const dao = new Dao(db)

    // ── playlists ─────────────────────────────────────────────────────────
    // Stores M3U playlist metadata per user.
    // Channels are not stored — they are fetched fresh from source_url each session.
    const playlists = new Collection({
        name: "playlists",
        type: "base",
        schema: [
            {
                name: "user",
                type: "relation",
                required: true,
                options: { collectionId: "_pb_users_auth_", cascadeDelete: true, minSelect: null, maxSelect: 1, displayFields: [] }
            },
            {
                name: "name",
                type: "text",
                required: true,
                options: { min: 1, max: 100, pattern: "" }
            },
            {
                name: "source_url",
                type: "url",
                required: false,
                options: { exceptDomains: [], onlyDomains: [] }
            },
        ],
        listRule:   "@request.auth.id != '' && user = @request.auth.id",
        viewRule:   "@request.auth.id != '' && user = @request.auth.id",
        createRule: "@request.auth.id != '' && @request.data.user = @request.auth.id",
        updateRule: "@request.auth.id != '' && user = @request.auth.id",
        deleteRule: "@request.auth.id != '' && user = @request.auth.id",
    })
    dao.saveCollection(playlists)

    // ── favorites ─────────────────────────────────────────────────────────
    const favorites = new Collection({
        name: "favorites",
        type: "base",
        schema: [
            {
                name: "user",
                type: "relation",
                required: true,
                options: { collectionId: "_pb_users_auth_", cascadeDelete: true, minSelect: null, maxSelect: 1, displayFields: [] }
            },
            {
                name: "playlist",
                type: "relation",
                required: true,
                options: { collectionId: "playlists", cascadeDelete: true, minSelect: null, maxSelect: 1, displayFields: [] }
            },
            {
                name: "channel_url",
                type: "text",
                required: true,
                options: { min: 1, max: null, pattern: "" }
            },
            {
                name: "channel_name",
                type: "text",
                required: true,
                options: { min: null, max: 200, pattern: "" }
            },
            {
                name: "channel_logo",
                type: "url",
                required: false,
                options: { exceptDomains: [], onlyDomains: [] }
            },
            {
                name: "channel_group",
                type: "text",
                required: false,
                options: { min: null, max: 100, pattern: "" }
            },
        ],
        listRule:   "@request.auth.id != '' && user = @request.auth.id",
        viewRule:   "@request.auth.id != '' && user = @request.auth.id",
        createRule: "@request.auth.id != '' && @request.data.user = @request.auth.id",
        updateRule: "@request.auth.id != '' && user = @request.auth.id",
        deleteRule: "@request.auth.id != '' && user = @request.auth.id",
    })
    dao.saveCollection(favorites)

    // ── history ───────────────────────────────────────────────────────────
    const history = new Collection({
        name: "history",
        type: "base",
        schema: [
            {
                name: "user",
                type: "relation",
                required: true,
                options: { collectionId: "_pb_users_auth_", cascadeDelete: true, minSelect: null, maxSelect: 1, displayFields: [] }
            },
            {
                name: "playlist",
                type: "relation",
                required: true,
                options: { collectionId: "playlists", cascadeDelete: true, minSelect: null, maxSelect: 1, displayFields: [] }
            },
            {
                name: "channel_url",
                type: "text",
                required: true,
                options: { min: 1, max: null, pattern: "" }
            },
            {
                name: "channel_name",
                type: "text",
                required: true,
                options: { min: null, max: 200, pattern: "" }
            },
            {
                name: "channel_logo",
                type: "url",
                required: false,
                options: { exceptDomains: [], onlyDomains: [] }
            },
            {
                name: "channel_group",
                type: "text",
                required: false,
                options: { min: null, max: 100, pattern: "" }
            },
            {
                name: "watched_at",
                type: "date",
                required: true,
                options: { min: "", max: "" }
            },
        ],
        listRule:   "@request.auth.id != '' && user = @request.auth.id",
        viewRule:   "@request.auth.id != '' && user = @request.auth.id",
        createRule: "@request.auth.id != '' && @request.data.user = @request.auth.id",
        updateRule: null,
        deleteRule: "@request.auth.id != '' && user = @request.auth.id",
    })
    dao.saveCollection(history)

}, (db) => {
    const dao = new Dao(db)
    for (const name of ["history", "favorites", "playlists"]) {
        try {
            dao.deleteCollection(dao.findCollectionByNameOrId(name))
        } catch (_) {}
    }
})
