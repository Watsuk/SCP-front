import {GameBase} from "/storage/js/framework/GameBase.js";
import {Vector2, Color} from "/storage/js/framework/data.js";
import { Drawable } from "/storage/js/framework/objects/graphic/drawable.js";

export class Container extends Drawable {
    Children;
    Masking;
    
    constructor(Position, Size, Depth, Rotation, Alpha, Color) {
        super(Position, Size, Depth, Rotation, Alpha, Color);
        
        this.Children = []
        this.Masking = false;
    }



    Add(Child){
        if (Child.Parent != undefined || GameBase.Instance.SpriteManager.sprites.indexOf(Child) != -1) {
            throw "You may not add drawable to multiple containers";
        }
        if (Child == undefined) {
            throw "Child was undefinded"
        }
        Child.Parent = this;
        this.Children.push(Child);
        this.Children.sort(function(a, b) {
            if (a.Depth > b.Depth) return -1;
            if (a.Depth < b.Depth) return 1;
            return 0;
          });
        Child.Load();
    }

    Remove(Child) {
        if (this.Children.indexOf(Child) == -1) {
            return;
        }
        Child.Parent = undefined;
        this.Children.splice(this.Children.indexOf(Child), 1);

    }

    
    Draw() {

        let container = super.Draw();
        if (container == null)
            return null;
        if (this.Masking) {
            container.style.overflow = "hidden";
        }
        this.Children.forEach(s => {
            let drawable = s.Draw();
            if (drawable == null) {
                return;
            }
            container.appendChild(drawable);
        });
        return container;
    }


    OnClick() {
        let toHandle = [...this.Children].reverse()
        let stopPropagation = false;
        toHandle.forEach(s => {
            if (stopPropagation)
                return;
            let beg = new Vector2(s.EffectivePosition.X, s.EffectivePosition.Y);
            let end = new Vector2(s.EffectivePosition.X + s.Size.X, s.EffectivePosition.Y + s.Size.Y);
            let cur = GameBase.Instance.MousePos;
            
            if ((cur.X >= beg.X && cur.X <= end.X)
                && (cur.Y >= beg.Y && cur.Y <= end.Y)) //We are in the 
                {
                    stopPropagation = s.OnClick()
                }
                
        }); 
    }
    
    
    Update() {
        this.Children.forEach(s => s.Update());
        let toHandle = [...this.Children].reverse();
        let stopPropagation = false;
        toHandle.forEach(s => {
            if (stopPropagation)
                return;
            let beg = new Vector2(s.EffectivePosition.X, s.EffectivePosition.Y);
            let end = new Vector2(s.EffectivePosition.X + s.Size.X, s.EffectivePosition.Y + s.Size.Y);
            let cur = GameBase.Instance.MousePos;
            
            if ((cur.X >= beg.X && cur.X <= end.X)
                && (cur.Y >= beg.Y && cur.Y <= end.Y)) 
                {
                stopPropagation = s.BlocksHover;
                if (!s.isHovered) {
                    s.OnHover();
                    s.isHovered = true;
                }
            }
            else {
                if (s.isHovered) {
                    s.OnHoverLost();
                    s.isHovered = false;
                }
            }
                
        });
    }


}