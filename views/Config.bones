view = Backbone.View.extend();

view.prototype.events = {
    'change input[name=updates]': 'updates',
    'change input[name=profile]': 'profile',
    'change input[name=verbose]': 'verbose',
    'change input[name=httpProxy]': 'proxy',
    'keyup input[name=httpProxy]': 'proxy',
    'keyup input[name=files]': 'files',
    'change input[name=files]': 'files',
    'keyup textarea[name=rsync]': 'rsync',
    'change textarea[name=rsync]': 'rsync',
    'click input[type=submit]': 'save',
    'click a[href=#disable]': 'disable',
    'click a[href="/oauth/mapbox"]': 'proxyWarning'
};

view.prototype.initialize = function(options) {
    this._restart = false;
    _(this).bindAll(
        'render',
        'changed',
        'files',
        'rsync',
        'updates',
        'disable',
        'save',
        'restart',
        'proxy',
        'verbose'
    );
    this.model.bind('change', this.changed);
    this.model.bind('change:files', this.restart);
    this.model.bind('change:httpProxy', this.restart);
    this.model.bind('change:verbose', this.restart);
    this.render();
};

view.prototype.render = function() {
    $('.bleed .active').removeClass('active');
    $('.bleed .settings').addClass('active');
    this.el.html(templates.Config(this.model));
    Bones.utils.sliders(this.$('.slider'), this.model);
    return this;
};

view.prototype.changed = function() {
    this.$('input[type=submit]').removeClass('disabled').val('Save');
};

view.prototype.saved = function() {
    this.$('input[type=submit]').addClass('disabled').val('Saved');
};

view.prototype.files = function(ev) {
    this.model.set({files: $(ev.currentTarget).val()});
    return false;
};

view.prototype.rsync = function(ev) {
    this.model.set({rsync: $(ev.currentTarget).val()});
    return false;
};

view.prototype.proxy = function(ev) {
    this.model.set({httpProxy: $(ev.currentTarget).val()});
    return false;
};

view.prototype.updates = function(ev) {
    this.model.set({updates: $(ev.currentTarget).is(':checked')});
};

view.prototype.profile = function(ev) {
    this.model.set({profile: $(ev.currentTarget).is(':checked')});
};

view.prototype.verbose = function(ev) {
    var value = $(ev.currentTarget).is(':checked') ? 'on' : 'off';
    this.model.set({verbose: value});
};

view.prototype.disable = function(ev) {
    this.model.set({
        'syncAccount': '',
        'syncAccessToken': ''
    });
    this.$('.syncOn').addClass('dependent');
    this.$('.syncOff').removeClass('dependent');
    return false;
};

view.prototype.save = function() {
    if (this.$('input[type=submit]').hasClass('disabled')) return false;

    this.model.save({}, {
        success: _(function() {
            if (this._restart) new views.Modal({
                content: 'These changes require you to restart TileMill manually.',
                affirmative: 'Ok',
                negative: '',
                callback: function() {}
            });
            this._restart = false;
            this.saved();
        }).bind(this),
        error: function(m, err) { new views.Modal(err); }
    });
    return false;
};

view.prototype.restart = function() {
    this._restart = true;
};

view.prototype.proxyWarning = function() {
    // Work around for lack of proxy support in topcube
    if (this.model.get('httpProxy') && !this.model.get('server')) {
        var view = new views.Modal({content: 'Unable to authorize with HTTP proxy.'});
        var msg = 'To authorize, open this link in a proxy enabled browser: <br> ' + window.location.origin + '/oauth/mapbox';
        view.el.children('.content').append($('<a href="/oauth/mapbox" target="_blank">'+msg+'</a>'));
        view.el.children('.bug').remove();
        return false;
    }
}
