/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {

    // ── Add role field to users ───────────────────────────────────────────
    const users = app.findCollectionByNameOrId("users")
    users.fields.add(new TextField({
        name: "role",
        required: true,
        options: { pattern: "^(admin|user)$" },
    }))
    app.save(users)

    // ── Drop old collections (had per-user fields) ────────────────────────
    for (const name of ["history", "favorites", "playlists"]) {
        try {
            app.delete(app.findCollectionByNameOrId(name))
        } catch (_) {}
    }

    // ── playlists (shared) ────────────────────────────────────────────────
    const playlists = new Collection({
        name: "playlists",
        type: "base",
        fields: [
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
        listRule:   "@request.auth.id != ''",
        viewRule:   "@request.auth.id != ''",
        createRule: "@request.auth.role = 'admin'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
    })
    app.save(playlists)

    const playlistsId = app.findCollectionByNameOrId("playlists").id

    // ── favorites (shared, admin manages) ────────────────────────────────
    const favorites = new Collection({
        name: "favorites",
        type: "base",
        fields: [
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
        listRule:   "@request.auth.id != ''",
        viewRule:   "@request.auth.id != ''",
        createRule: "@request.auth.role = 'admin'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
    })
    app.save(favorites)

    // ── history (shared, semua bisa create saat nonton) ───────────────────
    const history = new Collection({
        name: "history",
        type: "base",
        fields: [
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
        listRule:   "@request.auth.id != ''",
        viewRule:   "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: null,
        deleteRule: "@request.auth.role = 'admin'",
    })
    app.save(history)

}, (app) => {
    // Rollback: remove role field from users
    try {
        const users = app.findCollectionByNameOrId("users")
        users.fields.removeById(users.fields.getByName("role").id)
        app.save(users)
    } catch (_) {}

    for (const name of ["history", "favorites", "playlists"]) {
        try {
            app.delete(app.findCollectionByNameOrId(name))
        } catch (_) {}
    }
})
