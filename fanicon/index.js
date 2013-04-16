KISSY.add('fanicon/index',function(S, Node, Base, Event){
	var DOM = S.DOM,
		$ = Node.all,
		DIV = '<div>',
		ROOT_CLS = 'fanicon-shortcut',
		LIST_CLS = 'fanicon-shortcut-list',
		SURROUND_CLS = 'fanicon-shortcut-surround',
		CENTER_CLS = 'fanicon-shortcut-center',
		FOLD_EVENT = 'fanIconFold',
		UNFOLD_EVENT = 'fanIconUnfold';


	var BORDER_RADIUS = '-webkit-border-radius:{radius}px;-moz-border-radius:{radius}px;border-radius:{radius}px;';




	function FanIcon(centerIcon, surroundIcon, config){
		var self = this;
		FanIcon.superclass.constructor.call(self, config);
		self._init(centerIcon, surroundIcon);
	}

	FanIcon.ATTRS = {
		centerIcon : {},
		surroundIcon : {},
		centerRadius : {},
		surroundRadius : {},
    	fanRadius : {},
    	intervalDeg : {
    		value : 45 
    	},
    	startDeg : {
    		value : 0
    	},
    	direction : {
    		value : 1 //1为顺时针，-1为逆时针
    	},
    	zIndex : {
    		value : 2000
    	},
    	el : {},
    	centerEl : {},
    	surroundEl : {},
    	centerUnfoldedCls : {
    		value : 'fanicon-unfolded'
    	},
    	style : {
    		value : ''
    	}
    };

    S.augment(FanIcon, Event.Target);

	S.extend(FanIcon, S.Base, {
		_init: function(centerIcon, surroundIcon){
			var self = this;

			if(!S.isString(centerIcon)){
				return;
			}
			self.set('centerIcon',centerIcon);
			if(S.isArray(surroundIcon)){
				self.set('surroundIcon',surroundIcon);
			}else if(S.isString(surroundIcon)){
				self.set('surroundIcon',[].concat(surroundIcon));
			}else{
				return;
			}
			self._struct();
			self._initStyle();
			self._render();
			self._bindEvt();
		},
		_struct: function(){
			var self = this,
				el = $(DOM.create(DIV,{
					'class': ROOT_CLS,
					style: self.get('style')
				})),
				list = $(DOM.create(DIV,{
					'class': LIST_CLS,
					style: 'position:relative;'
				}));

			el.append(list);

			//create center node
			var centerEl = $(self.get('centerIcon'));
			centerEl.addClass(CENTER_CLS);
			list.append(centerEl);

			//create surrounding nodes
			S.each(self.get('surroundIcon'),function(icon, idx){
				var sEl = $(icon);
				sEl.addClass(SURROUND_CLS);
				sEl.insertBefore(centerEl);
			});


			self.set('el',el);
			self.set('centerEl',centerEl);
			self.set('surroundEl',Node.all('.' + SURROUND_CLS, el));

		},
		_initStyle: function(){
			var self = this,
				el = self.get('el'),
				centerEl = self.get('centerEl'),
				surroundEl = self.get('surroundEl'),
				centerSize = 2 * self.get('centerRadius'),
				surroundSize = 2 * self.get('surroundRadius'),
				zIndex = self.get('zIndex');
			el.css({
				width: centerSize + 'px',
				height: centerSize + 'px',
				'z-index': zIndex
			});
			centerEl.css({
				position: 'absolute',
				left: 0,
				top: 0,
				width: centerSize + 'px',
				height: centerSize + 'px',
				'z-index': zIndex + 1
			});
			surroundEl.css({
				position:'absolute',
				left:0,
				top:0,
				opacity:0,
				width: surroundSize + 'px',
				height: surroundSize + 'px'
			});
			DOM.addStyleSheet(' .' + SURROUND_CLS + '{' + 
								'-webkit-transition:all .2s ease-out;' + 
								'-moz-transition:all .2s ease-out;' + 
								'transition:all .2s ease-out;' + 
								S.substitute(BORDER_RADIUS,{radius: self.get('surroundRadius')}) +
							'}' + 
							' .' + CENTER_CLS + '{' +
								S.substitute(BORDER_RADIUS,{radius: self.get('centerRadius')}) +
							'}');
		},
		_initSurroundIconStyle: function(){

		},
		_render: function(){
			var self = this;
			self.get('el').appendTo('body');
		},

		_setSurroundIconPosition: function(){
			var self = this,
				surroundEl = self.get('surroundEl'),
				startDeg = self.get('startDeg'),
				direction = self.get('direction'),
				fanR = self.get('fanRadius'),
				centerR = self.get('centerRadius'),
				surroundR = self.get('surroundRadius'),
				intervalDeg = self.get('intervalDeg');

			S.each(surroundEl, function(sEl, idx){
				var theta = startDeg + direction * idx * intervalDeg;

				var left = fanR * Math.sin(deg2Rad(theta)) + centerR - surroundR;
				var top = -(fanR * Math.cos(deg2Rad(theta)) - centerR + surroundR);

				Node.one(sEl).css({
					left:left + 'px',
					top:top + 'px',
					opacity:1
				});
			});

		},

		_bindEvt: function(){
			var self = this,
				centerEl = self.get('centerEl'),
				surroundEl = self.get('surroundEl'),
				centerUnfoldedCls = self.get('centerUnfoldedCls');

			centerEl.on(Event.Gesture.tap,function(e){
				var icon = $(e.target);
				if(icon.hasClass(centerUnfoldedCls)){
					self.fold();
				}else{
					self.unfold();
				}
			});

			surroundEl.on(Event.Gesture.tap,function(e){
				self.fold();
			});

		},

		fold: function(){
			var self = this,
				centerEl = self.get('centerEl'),
				surroundEl = self.get('surroundEl'),
				centerUnfoldedCls = self.get('centerUnfoldedCls');

			centerEl.removeClass(centerUnfoldedCls);
			surroundEl.css({
				left:0,
				top:0,
				opacity:0
			});
			self.fire(FOLD_EVENT);
		},

		unfold: function(){
			var self = this,
				centerEl = self.get('centerEl'),
				centerUnfoldedCls = self.get('centerUnfoldedCls');

			self._setSurroundIconPosition();
			centerEl.addClass(centerUnfoldedCls);
			self.fire(UNFOLD_EVENT);
		},

		replaceSurround: function(surroundIcon){
			var self = this,
				el = self.get('el'),
				centerEl = self.get('centerEl'),
				surroundSize = 2 * self.get('surroundRadius');

			if(S.isArray(surroundIcon)){
				self.set('surroundIcon',surroundIcon);
			}else if(S.isString(surroundIcon)){
				self.set('surroundIcon',[].concat(surroundIcon));
			}else{
				return;
			}

			self.get('surroundEl').remove();

			//create surrounding nodes
			S.each(self.get('surroundIcon'),function(icon, idx){
				var sEl = $(icon);
				sEl.addClass(SURROUND_CLS);
				sEl.insertBefore(centerEl);
			});

			self.set('surroundEl',Node.all('.' + SURROUND_CLS, el));

			self.get('surroundEl').css({
				position:'absolute',
				left:0,
				top:0,
				opacity:0,
				width: surroundSize + 'px',
				height: surroundSize + 'px'
			}).on(Event.Gesture.tap,function(e){
				self.fold();
			});

		}

	});


	function deg2Rad(deg){
		return deg / 180 * Math.PI;
	}


	return FanIcon;
},{
	requires:['node','base','event']
});

