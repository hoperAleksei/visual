let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let canvas2 = document.getElementById("two");
let ctx2 = canvas2.getContext("2d");

canvas2.style.display = false;

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;




function dot(x, y, ctx, color=[0,0,0,255]) {
    // let id = ctx.createImageData(1,1);
    // let d = id.data;
    // d[0] = 0;
    // d[1] = 0;
    // d[2] = 0;
    // d[3] = 255;

    let id = new ImageData(new Uint8ClampedArray(color), 1, 1)
    // console.log(x,y, "12345")
    ctx.putImageData(id, Math.ceil(x), Math.ceil(y))

}

function dda(x, y, dx, dy, ctx) {
    let slope = (dy-y) / (dx-x);

    y = y + 0.5;

    while(x <= dx) {
        console.log(x, Math.ceil(y))
        dot(x, y, ctx);
        y = y + slope;
        x = x + slope;
    }
}

function lab(x1, y1, x2, y2, ctx) {
    let x = x1;
    let y = y1;

    let dx = x2 - x1;
    let dy = y2 - y1;


    dot(x, y, ctx);
    let count = dx;

    while (count > 0) {
        count -= 1;

        if (dy * (x+1) - dx * (y+0.5) - (x1 * dy - y1 * dx) > 0 ) {
            y = y + 1;
        }

        x = x + 1;

        dot(x,y, ctx);
    }


}

function set_pixel4(x0, y0, r, ctx){
    dot(x0, y0 + r, ctx)
    dot(x0, y0 - r, ctx)
    dot(x0 + r, y0, ctx)
    dot(x0 - r, y0, ctx)
}

function set_pixel8(x0, y0, x, y, ctx){
    dot(x0 + x, y0 + y, ctx)
    dot(x0 - x, y0 + y, ctx)
    dot(x0 + x, y0 - y, ctx)
    dot(x0 - x, y0 - y, ctx)

    dot(x0 + y, y0 + x, ctx)
    dot(x0 - y, y0 + x, ctx)
    dot(x0 + y, y0 - x, ctx)
    dot(x0 - y, y0 - x, ctx)
}


function cab(x0,y0,r, ctx) {

    function f(x,y,r){
        return x**2 + y**2 - r**2
    }
    let x = 0;
    let y = r;

    set_pixel4(x0,y0,r, ctx);
    while(x<=y) {
        console.log(x,y,f(x+1, y-0.5, r))
        if (f(x+1, y-0.5, r) < 0) {
            y++;
        }

        y--;
        x++;
        set_pixel8(x0, y0, x, y, ctx);

    }

}

function img_drow(src, ctx, f){
    let img = new Image();

    img.onload = function(){
        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height)
    }
    img.src = src;

    return img
}

function getcolor(x,y, ctx) {
    return ctx.getImageData(x,y,1,1).data
}

function fixed_thresholding(ctx, ctx_res, m=255){
    let c = getcolor(0,0,ctx)
    console.log(c)
    for (let y = 0; y < ctx.canvas.width; y++) {
        for (let x = 0; x < ctx.canvas.height; x++) {
            let c = getcolor(x,y,ctx)

            if (c[0] < m) {
                // console.log(c[0]+c[1]+c[2])
                dot(x, y, ctx_res)
            }
            else {
                dot(x,y,ctx_res,[255,255,255,255])
            }
        }
    }
}

function random_thresholding(ctx, ctx_res){
    let c = getcolor(0,0,ctx)
    console.log(c)
    for (let y = 0; y < ctx.canvas.width; y++) {
        for (let x = 0; x < ctx.canvas.height; x++) {
            let c = getcolor(x,y,ctx)

            if (c[0] < Math.floor(Math.random()*255*3)) {
                // console.log(c[0]+c[1]+c[2])
                dot(x, y, ctx_res)
            }
            else {
                dot(x,y,ctx_res,[255,255,255,255])
            }
        }
    }
}

function ordered_dither(ctx, ctx_res){
    let mx = [[0, 2], [3, 1]]

    for (let y = 0; y < ctx.canvas.width; y++) {
        for (let x = 0; x < ctx.canvas.height; x++) {
            let c = getcolor(x,y,ctx)

            if (c[0] * 5 / 256 > mx[y%2][x%2]) {
                // console.log(c[0]+c[1]+c[2])
                dot(x,y,ctx_res,[255,255,255,255])
            }
            else {
                dot(x, y, ctx_res)
            }
        }
    }

}

function error_diffusion(ctx,ctx_res, alg=0){
    /*
    * 0 - Floyd-Steinberg
    * 1 - Jarvice, Judice, Ninke
    * 2 - False Floyd-Steinberg
    * 3 - Stucki
    * 4 - Burkes
    * 5 - Frankie Sierra (1/32)
    * 6 - Frankie Sierra (1/16)
    * 7 - Frankie Sierra (1/4)
    *
    * */
    for (let y = 0; y < ctx.canvas.height; y++) {
        for (let x = 0; x < ctx.canvas.width; x++) {
            let c = getcolor(x, y, ctx)
            let n = c.map((x) => (Math.round(x / 255) === 1 ? 255 : 0))
            n[3] = 255
            dot(x, y, ctx_res, n)

            let e = [c[0] - n[0], c[1] - n[1], c[2] - n[2], 255]
            if (alg === 0) {
                dot(x + 1, y, ctx_res, getcolor(x + 1, y, ctx).map((o, i) => (i === 3 ? 255 : o + e[i] * 7 / 16)))
                dot(x - 1, y + 1, ctx_res, getcolor(x - 1, y + 1, ctx).map((o, i) => (i === 3 ? 255 : o + e[i] * 3 / 16)))
                dot(x, y + 1, ctx_res, getcolor(x, y + 1, ctx).map((o, i) => (i === 3 ? 255 : o + e[i] * 5 / 16)))
                dot(x + 1, y + 1, ctx_res, getcolor(x + 1, y + 1, ctx).map((o, i) => (i === 3 ? 255 : o + e[i] * 1 / 16)))
            }
            else if (alg = 1) {
                dot(x + 1, y, ctx_res, getcolor(x+1, y, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 7/48)))
                dot(x + 2, y, ctx_res, getcolor(x+2, y, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 5/48)))

                dot(x - 2, y+1, ctx_res, getcolor(x-2, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 3/48)))
                dot(x - 1, y+1, ctx_res, getcolor(x-1, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 5/48)))
                dot(x, y+1, ctx_res, getcolor(x, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 7/48)))
                dot(x + 1, y+1, ctx_res, getcolor(x+1, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 5/48)))
                dot(x + 2, y+1, ctx_res, getcolor(x+2, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 3/48)))

                dot(x - 2, y+2, ctx_res, getcolor(x-2, y+2, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 1/48)))
                dot(x - 1, y+2, ctx_res, getcolor(x-1, y+2, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 3/48)))
                dot(x, y+2, ctx_res, getcolor(x, y+2, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 5/48)))
                dot(x + 1, y+2, ctx_res, getcolor(x+1, y+2, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 3/48)))
                dot(x + 2, y+2, ctx_res, getcolor(x+2, y+2, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 1/48)))
            }
            else if (alg === 2) {
                dot(x + 1, y, ctx_res, getcolor(x + 1, y, ctx).map((o, i) => (i === 3 ? 255 : o + e[i] * 3 / 8)))
                dot(x, y + 1, ctx_res, getcolor(x, y + 1, ctx).map((o, i) => (i === 3 ? 255 : o + e[i] * 3 / 8)))
                dot(x+1, y + 1, ctx_res, getcolor(x+1, y + 1, ctx).map((o, i) => (i === 3 ? 255 : o + e[i] * 2 / 8)))
            }
            else if (alg === 3) {
                dot(x + 1, y, ctx_res, getcolor(x+1, y, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 8/42)))
                dot(x + 2, y, ctx_res, getcolor(x+2, y, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 4/42)))

                dot(x - 2, y+1, ctx_res, getcolor(x-2, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 2/42)))
                dot(x - 1, y+1, ctx_res, getcolor(x-1, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 4/42)))
                dot(x, y+1, ctx_res, getcolor(x, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 8/42)))
                dot(x + 1, y+1, ctx_res, getcolor(x+1, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 4/42)))
                dot(x + 2, y+1, ctx_res, getcolor(x+2, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 2/42)))

                dot(x - 2, y+2, ctx_res, getcolor(x-2, y+2, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 1/42)))
                dot(x - 1, y+2, ctx_res, getcolor(x-1, y+2, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 2/42)))
                dot(x, y+2, ctx_res, getcolor(x, y+2, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 4/42)))
                dot(x + 1, y+2, ctx_res, getcolor(x+1, y+2, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 2/42)))
                dot(x + 2, y+2, ctx_res, getcolor(x+2, y+2, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 1/42)))
            }
            else if (alg === 4) {
                dot(x + 1, y, ctx_res, getcolor(x+1, y, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 8/32)))
                dot(x + 2, y, ctx_res, getcolor(x+2, y, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 4/32)))

                dot(x - 2, y+1, ctx_res, getcolor(x-2, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 2/32)))
                dot(x - 1, y+1, ctx_res, getcolor(x-1, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 4/32)))
                dot(x, y+1, ctx_res, getcolor(x, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 8/32)))
                dot(x + 1, y+1, ctx_res, getcolor(x+1, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 4/32)))
                dot(x + 2, y+1, ctx_res, getcolor(x+2, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 2/32)))
            }
            else if (alg === 5) {
                dot(x + 1, y, ctx_res, getcolor(x+1, y, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 5/32)))
                dot(x + 2, y, ctx_res, getcolor(x+2, y, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 3/32)))

                dot(x - 2, y+1, ctx_res, getcolor(x-2, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 2/32)))
                dot(x - 1, y+1, ctx_res, getcolor(x-1, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 4/32)))
                dot(x, y+1, ctx_res, getcolor(x, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 5/32)))
                dot(x + 1, y+1, ctx_res, getcolor(x+1, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 4/32)))
                dot(x + 2, y+1, ctx_res, getcolor(x+2, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 2/32)))

                dot(x - 1, y+2, ctx_res, getcolor(x-1, y+2, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 2/32)))
                dot(x, y+2, ctx_res, getcolor(x, y+2, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 3/42)))
                dot(x + 1, y+2, ctx_res, getcolor(x+1, y+2, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 2/32)))
            }
            else if (alg === 6) {
                dot(x + 1, y, ctx_res, getcolor(x+1, y, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 4/16)))
                dot(x + 2, y, ctx_res, getcolor(x+2, y, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 3/16)))

                dot(x - 2, y+1, ctx_res, getcolor(x-2, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 1/16)))
                dot(x - 1, y+1, ctx_res, getcolor(x-1, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 2/16)))
                dot(x, y+1, ctx_res, getcolor(x, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 3/16)))
                dot(x + 1, y+1, ctx_res, getcolor(x+1, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 2/16)))
                dot(x + 2, y+1, ctx_res, getcolor(x+2, y+1, ctx).map((o, i)=>(i===3 ? 255 : o + e[i] * 1/16)))
            }
            else if (alg === 7) {
                dot(x + 1, y, ctx_res, getcolor(x + 1, y, ctx).map((o, i) => (i === 3 ? 255 : o + e[i] * 2 / 4)))
                dot(x - 1, y + 1, ctx_res, getcolor(x - 1, y + 1, ctx).map((o, i) => (i === 3 ? 255 : o + e[i] * 1 / 4)))
                dot(x, y + 1, ctx_res, getcolor(x, y + 1, ctx).map((o, i) => (i === 3 ? 255 : o + e[i] * 1 / 4)))
            }

        }
    }

    console.log("END")
}



function split_view(c1, c2){
    c1.canvas.style.display = "block";
    c2.canvas.style.display = "block";

    c1.canvas.style.width = "50%";
    c2.canvas.style.width = "50%";

    c1.canvas.width = c1.canvas.width/2
    c2.canvas.width = c1.canvas.width
    c2.canvas.height = c1.canvas.height

    c1.canvas.style.float = "left"
}



function onLoadHandler() {
    // ctx.transform(1, 0, 0, -1, 0, 0)



    // dot(10, 10, ctx);
    // dda(0,0,100,100, ctx);
    // lab(0,0,100,100, ctx)

    // cab(100,100,20, ctx)
    img_drow("img.png", ctx, ()=>{})
    split_view(ctx,ctx2)

    // img_drow("img.png", ctx)

    // random_thresholding(ctx,ctx2)
    console.log(getcolor(0,0,ctx))
    // dot(0,0, ctx2)

}

window.onload = onLoadHandler;