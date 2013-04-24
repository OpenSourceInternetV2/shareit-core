var shareit = (function(module, webp2p){
var _priv = module._priv = module._priv || {}

module.Local = function(handshake_servers_file, onsuccess)
{
  EventTarget.call(this);

  var self = this


  function forwardEvent(event)
  {
    self.dispatchEvent(event);
  }


  var peersManager = new webp2p.PeersManager(handshake_servers_file)

  // Init database
  _priv.DB_init(function(db)
  {
    // Init files manager
    var filesManager = new _priv.FilesManager(db, peersManager)

    // Init cache backup system
    var cacheBackup = new _priv.CacheBackup(db, filesManager)

    // Init sharedpoints manager
    var sharedpointsManager = new _priv.SharedpointsManager(db, filesManager)

    // Init search engine
    var searchEngine = new _priv.SearchEngine(db)


    self.cacheBackup_export = function(onfinish, onprogress, onerror)
    {
      cacheBackup.export(onfinish, onprogress, onerror)
    }

    self.cacheBackup_import = function(blob, callback)
    {
      cacheBackup.import(blob, callback)
    }

    /**
     * Connects to another peer based on its UID. If we are already connected,
     * it does nothing.
     * @param {UUID} uid Identifier of the other peer to be connected.
     * @param {MessageChannel} incomingChannel Optional channel where to
     * @param {Function} cb Callback.
     * send the offer. If not defined send it to all connected peers.
     */
    self.connectTo = function(uid, incomingChannel, callback)
    {
      peersManager.connectTo(uid, incomingChannel, callback)
    }

    self.files_downloading = function(callback)
    {
      filesManager.files_downloading(callback)
    }

    self.files_sharing = function(callback)
    {
      filesManager.files_sharing(callback)
    }

    self.numPeers = function(callback)
    {
      callback(null, Object.keys(peersManager.getChannels()).length);
    }

    self.searchEngine_search = function(query, callback)
    {
      searchEngine.search(query, callback)
    }

    self.sharedpointsManager_addSharedpoint_Folder = function(files, callback)
    {
      sharedpointsManager.addSharedpoint_Folder(files, callback)
    }

    self.sharedpointsManager_getSharedpoints = function(callback)
    {
      sharedpointsManager.getSharedpoints(callback)
    }

    /**
     * Start the download of a file
     * @param {Fileentry} Fileentry of the file to be downloaded.
     */
    self.transfer_begin = function(fileentry)
    {
      filesManager.transfer_begin(fileentry)
    }


    peersManager.addEventListener('error.noPeers', forwardEvent);
    peersManager.addEventListener('uid', forwardEvent);

    filesManager.addEventListener('file.added',   forwardEvent);
    filesManager.addEventListener('file.deleted', forwardEvent);

    filesManager.addEventListener('transfer.begin',  forwardEvent);
    filesManager.addEventListener('transfer.end',    forwardEvent);
    filesManager.addEventListener('transfer.update', forwardEvent);

    sharedpointsManager.addEventListener('sharedpoints.update', forwardEvent);

    if(onsuccess)
      onsuccess(self)
  })
}

return module
})(shareit || {}, webp2p)