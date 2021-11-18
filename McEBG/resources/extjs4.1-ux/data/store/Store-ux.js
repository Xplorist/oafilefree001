/**
 * 擴展store的功能 momo 2012.09.14
 */
Ext.data.Store.override({
	findRecord : function(field, value) {
		var me = this;
		var collection;
		if (me.isFiltered()) {
			collection = me.snapshot;
		} else {
			collection = me.data;
		}
		var record = collection.findBy(function(item) {
			return item.get(field) == value;
		});
		return record;
	},
	/**
	 * 查詢field為value的所有數據
	 * @param {} field
	 * @param {} value
	 * @return {}
	 */
	findRecords : function(field, value) {
		var me = this;
		var collection;
		var records = [];
		if (me.isFiltered()) {
			collection = me.snapshot;
			var mixColl = collection.filterBy(function(item) {
				return item.get(field) == value;
			});
			mixColl.each(function(item) {
				records.push(item);
			});
		} else {
			me.each(function(item) {
				if (item.get(field) == value)
					records.push(item);
			});
		}

		return records;
	},
	/**
	 * 只提交刪除的記錄
	 */
	postRemoveChange : function(record) {
		var me = this,
			options = {},
			toDestroy = record ? [record] : me.getRemovedRecords();
		if (toDestroy.length > 0) {
			options.destroy = toDestroy;
			me.proxy.batch(options, me.getBatchListeners());
		}
	},
	/**
	 * 回滾所有已經變更但未提交服務器的操作
	 */
	rollbackChange : function() {
		var me = this,
			count = me.getChangeCount();
		if (count > 0) {
			urs = me.getUpdatedRecords(), rrs = me.getRemovedRecords(), nrs = me.getNewRecords();
			for (var i = 0; i < urs.length; i++) {
				urs[i].reject();
			}
			me.remove(nrs);
			me.add(rrs);
			Ext.clean(rrs);
		}
	},
	/**
	 * 獲取已經變更的記錄條數
	 */
	getChangeCount : function() {
		var me = this,
			updateCount = 0;
		if (me.isFiltered()) {
			for (var index = 0; index < me.snapshot.items.length; index++) {
				if (me.snapshot.items[index].phantom || me.snapshot.items[index].dirty) {
					updateCount++;
				}
			}
			updateCount += me.getRemovedRecords().length;
		} else {
			updateCount += me.getUpdatedRecords().length;
			updateCount += me.getRemovedRecords().length;
			updateCount += me.getNewRecords().length;
		}
		return updateCount;
	},
	/**
	 * 驗證變更的數據是否正確 調用Model的validRecord方法，返回數據格式{pass:boolean,msg:string}
	 */
	validChange : function() {//處理同步數據前 驗證數據
		var me = this,
			urs = me.getUpdatedRecords(),
			crs = me.getNewRecords(),
			msg = '',
			result = true;
		if (me.isFiltered()) {
			var shot = me.snapshot.clone();
			for (var i = 0; i < urs.length; i++) {
				if (shot.get(urs[i].internalId)) {
					shot.removeAtKey(urs[i].internalId);
				}
			}
			for (var i = 0; i < crs.length; i++) {
				if (shot.get(crs[i].internalId)) {
					shot.removeAtKey(crs[i].internalId);
				}
			}
			for (var index = 0; index < shot.items.length; index++) {
				var item = shot.items[index];
				if (item.phantom) {
					var vm = item.validRecord();
					if (vm === null) {
						me.snapshot.removeAtKey(item.internalId);
					} else if (vm.pass == false) {
						msg += vm.msg;
						result = false;
					}
				} else if (item.dirty) {
					var vm = item.validRecord();
					if (!vm.pass) {
						msg += vm.msg;
						result = false;
					}
				}
			}
		}
		if (urs)
			for (var i = 0; i < urs.length; i++) {
				var vm = urs[i].validRecord();
				if (!vm.pass) {
					msg += vm.msg;
					result = false;
				}
			}
		if (crs)
			for (var i = 0; i < crs.length; i++) {
				var vm = crs[i].validRecord();
				if (vm === null) {
					me.remove(crs[i]);
				} else if (vm.pass == false) {
					msg += vm.msg;
					result = false;
				}
			}
		if (!result) {
			me.fireEvent('validRecordsOutMsg', me, msg);
		}
		return {
			msg : msg,
			pass : result
		};
	},
	filterToEmpty : function() {
		var me = this;
		me.filters.clear();
		if (me.isFiltered()) {
			me.loadData(me.snapshot.clone().items, true);
			delete me.snapshot;
		}
		me.filter(me.proxy.reader.idPropert || '_empty_date', '-1');
	},
	removeByField : function(field, value) {
		var me = this;
		var collection;
		if (me.isFiltered()) {
			collection = me.snapshot;
		} else {
			collection = me.data;
		}
		var record = true;
		while (record) {
			record = collection.findBy(function(item) {
				return item.get(field) == value;
			});
			if (!record) {
				break;
			}
			collection.remove(record);
			if (me.isFiltered()) {
				me.data.remove(record);
			}
		};
	},
	countByField : function(field, value) {
		var me = this, collection,
			count = 0;
		if (me.isFiltered()) {
			collection = me.snapshot;
		} else {
			collection = me.data;
		}
		collection.each(function(item) {
			if (item.get(field) == value)
				count++;
		});
		return count;
	},
	/**
	 * 用store的read url 讀取數據把他append 到store里
	 */
	appendData : function(param, fn, scope) {
		var me = this,
			proxy = me.proxy,
			reader = proxy.reader;
		jQuery.ajax({
			type : "POST",
			url : proxy.api.read,
			data : param,
			dataType : "json",
			success : function(response, textStatus) {
				var su = response[me.proxy.reader.successProperty];
				var rs = [];
				if (su) {
					var ds = response[me.proxy.reader.root];
					if (ds) {
						var len = ds.length, record;
						var isFilter = me.isFiltered();
						for (i = 0; i < len; i++) {
							record = ds[i];
							if (!(record instanceof Ext.data.Model)) {
								record = Ext.ModelManager.create(record, me.model);
								rs.push(record);
								if (isFilter)
									me.snapshot.add(record.internalId, record);
							}
						}
						me.loadRecords(rs, {
							addRecords : true
						});
					}
				}
				if (fn instanceof Function) {
					fn.call(scope || me, response, true);
				}
			},
			error : function(XMLHttpRequest, textStatus, errorThrown) {
				if (fn instanceof Function) {
					fn.call(scope || me, errorThrown, false);
				}
			}
		});
	},
	/**
	 * 重新加載數據
	 * @param param 加載數據時附帶提交的參數(可選)
	 * @param fn 完成加載后需要回調的函數(可選)
	 * @param scope 回調函數的作用域，如果沒有指定，就是用當前store(可選)
	 */
	reload : function(param, fn, scope) {
		var me = this;
		me.getProxy().extraParams = Ext.merge(me.getProxy().extraParams, param);
		me.currentPage = 1;
		me.removeAll();
		me.load({
			scope : me,
			callback : function(records, operation, success) {
				if (!success) {
					me.fireEvent('loadDataErrorOutMsg', me, decodeObject(operation.error));
				} else {
					if (fn instanceof Function) {
						fn.call(scope || me, records);
					}
				}
			}
		});
	}
});