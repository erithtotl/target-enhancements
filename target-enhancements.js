/**
 * main entry point
 * Used to kickoff our target enhancements
 */

const mod = "target-enhancements";
window.myx = '';
import { __filters }  from './src/pixi-filters.js';


Array.prototype.partition = function(rule) {
    return this.reduce((acc, val) => {
      let test = rule(val);
      acc[Number(test)].push(val);
      return acc;
    }, [[], []]);
  };

class TargetEnhancements {

    icon_size = 40;

    static async ready() {
        // register game settings

    }

    static hoverTokenEventHandler(token,tf) { token.target.clear();};
 


    static isSelfTarget() {
        
    }


    static async targetTokenEventHandler(usr, token, targeted) {
       
        // initialize some values
        var userArray = [];
        var othersArray = [];
        let tokenTargets = await token.targeted; // this takes time to arrive
  
        // clear any existing items/icons
        await token.target.clear();
        await token.target.removeChildren();






        // if for some reason we still don't have a size
        if (!tokenTargets.size) return;

        
        // split the targets into two arrays -- we don't need to show player their own icon
        tokenTargets.forEach( u => {
            if (u.id == game.user.id) {
                userArray.push(u);
            } else {
                othersArray.push(u);
            }
        });

        //-----------------------------
        //           Target
        //-----------------------------
        if (userArray.length) { TargetEnhancements.drawFoundryTargetIndicators(token);}

        //-----------------------------
        //           Tokens
        //-----------------------------
        if (!othersArray.length) { return;} // only user is ourself or no one

        // get our tokens & add tem to the dislplay
        let tokensContainer = await TargetEnhancements.getTokens(othersArray);

        token.target.addChild(tokensContainer);



        
        ///////////////////////// Animation?
        ///////////////////////// Supplemental
        
    }
    static async drawFoundryTargetIndicators(token) {
        let p = 4;
        let aw = 12;
        let h = token.h;
        let hh = token.h / 2;
        let w = token.w;
        let hw = w / 2;
        let ah = canvas.dimensions.size / 3;
        token.target.beginFill(0xFF9829, 1.0).lineStyle(1, 0x000000)
        .drawPolygon([-p,hh, -p-aw,hh-ah, -p-aw,hh+ah])
        .drawPolygon([w+p,hh, w+p+aw,hh-ah, w+p+aw,hh+ah])
        .drawPolygon([hw,-p, hw-ah,-p-aw, hw+ah,-p-aw])
        .drawPolygon([hw,h+p, hw-ah,h+p+aw, hw+ah,h+p+aw]);
    }
    static async getTokens(others) {
        // icon/avatar info
        this.icon_size = canvas.dimensions.size / 3.5;
        let num_icons = others.length;

        let tc = await new PIXI.Container();
        for ( let [i, u] of others.entries() ) {
            tc.addChild( await TargetEnhancements.getIcon(u,i));
        }
        return tc;
    }


    static async getIcon(user,idx) {
        let icon = {};
        let padding = 2;

        try {
            icon = PIXI.Sprite.from(user.avatar);
        } catch (err) {
            icon = PIXI.Sprite.from("icons/svg/mystery-man.svg");
        }
        icon.anchor.x = 0;
        icon.anchor.y = 0;

        if (idx == 0) {
            icon.position.x = icon.position.y = 0;
        } else if (idx % 2 == 0) {
            icon.position.y = this.icon_size * idx + padding;
            icon.position.x = 0;
            if (idx > 2) { icon.position.x = this.icon_size * idx + padding;}
        } else {
            icon.position.x = this.icon_size * idx + padding;
            icon.position.y = 0;
        }
        icon.width  = this.icon_size;
        icon.height = this.icon_size;
        icon.filters = await TargetEnhancements.applyFilters();
        return icon;
        
    }

    static applyFilters() {
       var filters = new ImageFilters();
       filters.DropShadow().Outline(4);
       return filters.filters;
    }
}

class ImageFilters {
    constructor () {
        this._filters = [];
    }
    get filters() {
        return this._filters;
    }
    DropShadow() {
        let shadow = new PIXI.filters.DropShadowFilter(); 
        shadow.blur = 4; 
        shadow.alpha = 1; 
        shadow.distance = 5;
        shadow.angle = Math.PI/4;
        this._filters.push(shadow);
        return this;
    }
    Bevel() {
        let bevel = new PIXI.filters.BevelFilter();
        this._filters.push(bevel);
        return this;
    }
    Outline(thickness = 1) {
        let outline = new PIXI.filters.OutlineFilter(thickness);
        this._filters.push(outline);
        return this;
    }
    Alpha(val) {
        let alpha = new PIXI.filters.AlphaFilter(val=1);
        this._filters.push(alpha);
        return this;
    }

}

Hooks.on("ready", TargetEnhancements.ready);
Hooks.on("targetToken", TargetEnhancements.targetTokenEventHandler);
Hooks.on("hoverToken", TargetEnhancements.hoverTokenEventHandler);