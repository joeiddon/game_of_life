cnvs = document.getElementById("cnvs")
ctx = cnvs.getContext("2d")

function resize(){
    cnvs.width = cnvs.height = Math.min(innerWidth, innerHeight)
    ss = cnvs.width / gridSize
}

window.addEventListener("resize", resize)

gridSize = 64

resize()

function initGrid(){
    ss = cnvs.width / gridSize
    grid = []
    for (var ri = 0; ri < gridSize; ri++){
        var r = []
        for (var ci = 0; ci < gridSize; ci++){
            r.push(0)
        }
        grid.push(r)
    }
}

initGrid()
stmp = [[1]]
rnd = 0

ctx.fillStyle = "white"
startup()

function startup(){
    ctx.textAlign = "center"
    ctx.font = "40px monospace"
    ctx.fillText("Welcome to Conway's Game of Life", cnvs.width/2, cnvs.height/5)
    ctx.font = "20px monospace"
    var lns = ["Control the simulation with these buttons -->",
               "Use your mouse to create cells",
               "There are hotkeys that change the pattern that your mouse creates",
               "To do multiple ticks, press the tick button then hold Enter",
               "Drag a rectangle with your mouse to destroy a section of cells"]
    var lh = 50
    for (var l = 0; l < lns.length; l++){
        ctx.fillText(lns[l], cnvs.width/2, cnvs.height/2 - lh * (4 - l))
    }
}
    

function randScramble(){
    prob = parseFloat(prompt("1 probability"))
    for (var r = 0; r < gridSize; r++){
        for (var c = 0; c < gridSize; c++){
            grid[r][c] = Math.random() < prob
        }
    }
    draw()
}

function dsplyHtks(){
    htks = [["b", "block"],
            ["g", "glider"],
            ["l", "LWSS"],
            ["s", "shooter"],
            ["a", "annihilator"],
            ["i", "infinite"],
            ["entr", "run"],
            ["left", "rotate anti-clck"],
            ["right", "rotate clck"]]
    prnt(htks)
}

function bgnRnd(){
    rsz = parseInt(prompt("pattern space"))
    cntLmt = parseInt(prompt("max ticks"))
    cnt = 0
    ptn = 1
    tckfl = false
    
    lmt = Math.pow(2, rsz * rsz) //just for stats
    
    rnd = setInterval(function(){
        if (cnt < cntLmt && !tckfl){
            tick()
            cnt++;
        } else {
            initGrid()
            var tl = Math.floor(gridSize/2-rsz/2)
            drawStamp(patternFromInt(ptn, rsz), tl, tl)
            ptn = (ptn+1)%Math.pow(2,rsz*rsz);
            cnt = 0;
            tckfl = false
        }
        lastGrid = grid
        var sts = [["pattern space", rsz],
                   ["pattern tot.", lmt],
                   ["pattern no", ptn],
                   ["tick no", cnt]]
        prnt(sts)
    }, 5)
}

function prnt(rws){
    var fntsz = 20
    var brdr = 5
    var lnspc = 2
    ctx.font = fntsz.toString() + "px monospace"
    ctx.textAlign = "start"
    for (var r = 0; r < rws.length; r++){
        ctx.fillText(rws[r][0]+" : "+rws[r][1].toString(), brdr, (r+1)*(fntsz+lnspc)+brdr)
    }
}

function patternFromInt(n, sz){
    var rws = (n).toString(2).padStart(sz*sz, '0').match(new RegExp('.{1,'+sz+'}', 'g'))
    var ptrn = []
    for (var ri = 0; ri < sz; ri++){
        var r = []
        for (var ci = 0; ci < sz; ci++){
            r.push(parseInt(rws[ri][ci]))
        }
        ptrn.push(r)
    }
    return ptrn
}

function identical(a1, a2){
    for (var r = 0; r < a1.length; r++){
        for (var c = 0; c < a1.length; c++){
            if (a1[r][c] != a2[r][c]) return false
        }
    }
    return true
}

function drawStamp(ptrn, r, c){ //r, c is position of top left of stamp
    for (var ri= 0; ri < ptrn.length; ri++){
        for (var ci= 0; ci < ptrn[0].length; ci++){
            grid[r+ri][c+ci] = ptrn[ri][ci]
        }
    }
    draw()
}

function tick(){
    var gridCpy = []
    for (var r = 0; r < gridSize; r++){
        gridCpy.push(grid[r].slice())
        for (var c = 0; c < gridSize; c++){
            nghbrs = [[r+1,c], [r+1,c+1], [r, c+1], [r-1,c+1], [r-1,c], [r-1,c-1], [r,c-1], [r+1,c-1]]
            nghbrs = nghbrs.filter(n => n[0] >= 0 && n[1] >= 0 && n[0] < gridSize && n[1] < gridSize)
            alv = nghbrs.filter(n => grid[n[0]][n[1]])
            if (grid[r][c] && (alv.length == 2 || alv.length == 3)){
                gridCpy[r][c] = 1
            } else if (!grid[r][c] && alv.length == 3){
                gridCpy[r][c] = 1
            } else {
                gridCpy[r][c] = 0
            }
        }
    }
    tckfl = identical(grid, gridCpy)
    grid = gridCpy
    draw()
}

function fill(r, c){
    ctx.fillRect(c * ss, r * ss, ss, ss)
}

function draw(){
    ctx.clearRect(0, 0, cnvs.width, cnvs.height)
    for (var r = 0; r < gridSize; r++){
        for (var c = 0; c < gridSize; c++){
            if (grid[r][c]) fill(r, c)
        }
    }
}

function rotateStamp(d){    //-1 << left , right >> 1
    var nwStmp = []
    for (var ri = 0; ri < stmp[0].length; ri++){
        var r = []
        for (var ci = 0; ci < stmp.length; ci++){
            r.push(0)
        }
        nwStmp.push(r)
    }
    for (var ri = 0; ri < stmp.length; ri++){
        for (var ci = 0; ci < stmp[0].length; ci++){
            if (d == 1){ //right, transpose then reverse rows
                nwStmp[ci][stmp.length-ri-1] = stmp[ri][ci]
            } else {     //left,  reverse rows then transpose
                nwStmp[stmp[0].length-ci-1][ri] = stmp[ri][ci]

            }
        }
    }
    stmp = nwStmp
}

cnvs.addEventListener("mousedown", function (e){
    mouseR = Math.floor(e.offsetY / ss)
    mouseC = Math.floor(e.offsetX / ss)
})

cnvs.addEventListener("mouseup", function(e){
    var nr = Math.floor(e.offsetY / ss)
    var nc = Math.floor(e.offsetX / ss)
    if (nr == mouseR && nc == mouseC){  //if released in the same place
        drawStamp(stmp, nr, nc)
    } else {  //if released in diffrnt place, then blank that rectangle
        for (var r = Math.min(mouseR, nr); r < Math.max(mouseR, nr); r++){
            for (var c = Math.min(mouseC, nc); c < Math.max(mouseC, nc); c++){
                grid[r][c] = 0
            }
        }
        draw()
    }
})

window.addEventListener("keydown", function (e){
    if (e.key in stmps){
        stmp = stmps[e.key]
    } else if (e.key == "ArrowLeft" || e.key == "ArrowRight"){
        rotateStamp(e.key == "ArrowLeft" ? -1 : 1)
    }
})
