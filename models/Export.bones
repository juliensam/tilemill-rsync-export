// Export
// ------
// Allow rsync exports

model = models.Export.augment({
});

model.prototype.schema.properties.format = {
    type: 'string',
    'required': true,
    'enum': ['png', 'pdf', 'svg', 'mbtiles', 'upload', 'sync', 'rsync']
};

