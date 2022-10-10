function _(el) {
    return document.querySelector(el);
}

function removeElement(el) {
    el.parentElement.removeChild(el);
}

function calcStyle(el) {
    return el.currentStyle || window.getComputedStyle(el);
}

function setBlocksCount() {
    blocksCountContainer.innerHTML = "Blocks: " + blocksCount;
}

function renderWorld(blocks) {
    var zOffset = 0;
    var xOffset = 0;

    for (var i = 0; i < blocks.length; i++) {

        if (i % worldSize === 0 && i > zOffset) {
            zOffset += 1;
            xOffset = 0;
        }

        createBlock(blocks[i].block, xOffset, 0, zOffset);

        xOffset += 1;
    }

    var gameSize = 100 * worldSize;

    game.style.width = `${gameSize}px`;
    game.style.transformOrigin = `${gameSize / 2}px 50px ${gameSize / 2}px`;

    if (spawnTreesCheckBox.checked) {
        var treeAmount = randomInt(1, worldSize / 2);

        for (var i = 0; i < treeAmount; i++) {
            generateTree();
        }
    }
}

function getBlocksAtLayer(yOffset) {
    var blocks = document.getElementsByClassName("block");
    var blocksAtLayer = [];

    for (var i = 0; i < blocks.length; i++) {
        if (yOffset === getBlockOffsets(blocks[i]).yOffset) {
            blocksAtLayer[blocksAtLayer.length] = blocks[i];
        }
    }

    return blocksAtLayer;
}

function mobSlime(slime, xOffset, zOffset) {
    var slimeXOffset = xOffset;
    var slimeZOffset = zOffset;
    var lastYOffset = 0;

    var setFalling = setInterval(() => {
        var uniqueBlocks = getBlocksAtOffset(slimeXOffset, slimeZOffset);
        var blocksBelow = [];

        for (var i = 0; i < uniqueBlocks.length; i++) {
            blocksBelow[blocksBelow.length] = uniqueBlocks[i];
        }

        sortArrayByKey(blocksBelow, o => getBlockOffsets(o).yOffset);

        try {
            var targetBlockYOffset = getBlockOffsets(blocksBelow[0]).yOffset;

            if (lastYOffset - targetBlockYOffset <= 1) {
                slime.style.top = `${targetBlockYOffset * 100}px`;
                lastYOffset = targetBlockYOffset;
            }
        } catch (err) {
            removeElement(slime);
            clearInterval(updateSlimePosition);
            clearInterval(setFalling);
        }

    }, 200);

    var updateSlimePosition = setInterval(() => {
        if (movingMobsCheckBox.checked) {
            if (getBlocksAtLayer(0).length > 0 && atYOffset(getBlocksAtOffset(slimeXOffset, slimeZOffset), 0)) {
                var newSlimeXOffset = Math.abs(slimeXOffset + randomInt(-1, 2));
                var newSlimeZOffset = Math.abs(slimeZOffset + randomInt(-1, 2));

                if (slimeXOffset > worldSize || slimeZOffset > worldSize) {
                    slimeXOffset = 0;
                    slimeZOffset = 0;
                }

                if (atYOffset(getBlocksAtOffset(newSlimeXOffset, newSlimeZOffset), 0) && !atYOffset(getBlocksAtOffset(newSlimeXOffset, newSlimeZOffset), lastYOffset - 2)) {
                    slimeXOffset = newSlimeXOffset;
                    slimeZOffset = newSlimeZOffset;
    
                    slime.style.left = `${slimeXOffset * 100}px`;
                    slime.style.transform = `translateZ(${slimeZOffset * 100}px)`;
                }
            } else {
                removeElement(slime);
                clearInterval(updateSlimePosition);
                clearInterval(setFalling);
            }
        }
    }, 2000);

    slime.addEventListener("click", () => {
        removeElement(slime);
        clearInterval(updateSlimePosition);
        clearInterval(setFalling);
    });
}

function spawnSlime(target) {
    if (target.parentElement.classList.contains("block")) {
        var targetBlock = target.parentElement;
        var targetOffsets = getBlockOffsets(targetBlock);

        var slime = document.createElement("div");
        slime.classList.add("slime");

        var shadow = document.createElement("div");
        shadow.classList.add("shadow");
        slime.appendChild(shadow)

        for (var i = 0; i < sides.length; i++) {
            var side = document.createElement("div");
            side.classList.add(sides[i]);
            slime.appendChild(side);
        }

        var inner = document.createElement("div");
        inner.classList.add("inner");

        for (var i = 0; i < sides.length; i++) {
            var side = document.createElement("div");
            side.classList.add(sides[i]);
            inner.appendChild(side);
        }

        slime.style.left = `${targetOffsets.xOffset * 100}px`;
        slime.style.top = `${targetOffsets.yOffset * 100}px`;
        slime.style.transform = `translateZ(${targetOffsets.zOffset * 100}px)`;

        slime.appendChild(inner);
        game.appendChild(slime);

        mobSlime(slime, targetOffsets.xOffset, targetOffsets.zOffset);
    }
}

function getBlockName(block) {
    var blockName = block.getAttribute("data-block-name");
    return blockName;
}

function generateTree() {
    var xOffset = randomInt(0, worldSize);
    var zOffset = randomInt(0, worldSize);

    for (var i = 0; i < 3; i++) {
        createBlock("log", xOffset, -1 * (i + 1), zOffset);
    }

    var leavesOffsets = [
        {
            xOffset: xOffset - 1,
            yOffset: -3,
            zOffset: zOffset
        },
        {
            xOffset: xOffset + 1,
            yOffset: -3,
            zOffset: zOffset
        },
        {
            xOffset: xOffset,
            yOffset: -3,
            zOffset: zOffset + 1
        },
        {
            xOffset: xOffset,
            yOffset: -3,
            zOffset: zOffset - 1
        },
        {
            xOffset: xOffset,
            yOffset: -4,
            zOffset: zOffset
        }
    ]

    for (var i = 0; i < leavesOffsets.length; i++) {
        createBlock("leaves", leavesOffsets[i].xOffset, leavesOffsets[i].yOffset, leavesOffsets[i].zOffset)
    }
}

function getBlocksAtOffset(xOffset, zOffset) {
    var xBlocks = Array.from(document.querySelectorAll(`[data-x-offset="${xOffset}"]`));
    var yBlocks = Array.from(document.querySelectorAll(`[data-z-offset="${zOffset}"]`));

    var uniqueBlocks = yBlocks.filter((obj) => {
        return xBlocks.indexOf(obj) !== -1;
    });

    return uniqueBlocks;
}

function atYOffset(blocks, yOffset) {

    for (var i = 0; i < blocks.length; i++) {
        if (getBlockOffsets(blocks[i]).yOffset === yOffset) {
            var blockAtYOffset = blocks[i];
        }
    }

    return blockAtYOffset;
}

function createBlock(blockName, xOffset, yOffset, zOffset) {

    var block = document.createElement("div");
    block.classList.add("block");

    for (var i = 0; i < sides.length; i++) {
        var blockSide = document.createElement("div");
        blockSide.classList.add(sides[i]);
        blockSide.style.backgroundImage = `url(img/${blockName}/${sides[i]}.png`;

        block.appendChild(blockSide);
    }

    block.setAttribute("data-x-offset", xOffset);
    block.setAttribute("data-z-offset", zOffset);
    block.setAttribute("data-y-offset", yOffset);
    block.setAttribute("data-block-name", blockName);

    block.style.left = `${100 * xOffset}px`;
    block.style.top = `${100 * yOffset}px`;
    block.style.transform = `translateZ(${100 * zOffset}px)`;

    (function () {
        block.addEventListener("click", (event) => {
            var clickedBlock = event.target.parentElement;

            breakBlock(clickedBlock);
        });
    }());

    game.appendChild(block);

    if (blockName === "sand" || blockName === "tnt") {
        block.classList.add("fallingBlock");

        var setFalling = setInterval(() => {
            if (sandPhysicsCheckBox.checked) {
                if (block.classList.contains("fallingBlock")) {
                    try {
                        var uniqueBlocks = getBlocksAtOffset(xOffset, zOffset);
                        var blockYOffset = getBlockOffsets(block).yOffset;
                        var blocksBelow = [];

                        for (var i = 0; i < uniqueBlocks.length; i++) {
                            var currentBlockYOffset = getBlockOffsets(uniqueBlocks[i]).yOffset;

                            if (currentBlockYOffset > blockYOffset) {
                                blocksBelow[blocksBelow.length] = uniqueBlocks[i];
                            }
                        }

                        sortArrayByKey(blocksBelow, o => getBlockOffsets(o).yOffset);

                        var targetBlockYOffset = getBlockOffsets(blocksBelow[0]).yOffset - 1;
                    } catch (err) {
                        var targetBlockYOffset = 0;
                    }

                    block.setAttribute("data-y-offset", targetBlockYOffset);

                    setTimeout(() => {
                        block.style.top = `${targetBlockYOffset * 100}px`;
                    }, 50);
                } else {
                    clearInterval(setFalling);
                }
            }
        }, 200);
    }

    if (blockName === "tnt" && explodingTNTCheckBox.checked) {
        var tntBlockSides = block.getElementsByTagName("div");

        for (var i = 0; i < tntBlockSides.length; i++) {
            tntBlockSides[i].classList.add("tntBlink");
        }

        setTimeout(() => {
            for (var i = 0; i < tntBlockSides.length; i++) {
                tntBlockSides[i].classList.add("expand");
            }
        }, 2000);


        setTimeout(() => {
            var explosionBlocks = [];

            var offsets = getBlockOffsets(block);
            var xOffset = offsets.xOffset;
            var yOffset = offsets.yOffset;
            var zOffset = offsets.zOffset;

            for (var i = -1; i <= 1; i++) {
                explosionBlocks[explosionBlocks.length] = atYOffset(getBlocksAtOffset(xOffset, zOffset), yOffset + i);
                explosionBlocks[explosionBlocks.length] = atYOffset(getBlocksAtOffset(xOffset + i, zOffset), yOffset);
                explosionBlocks[explosionBlocks.length] = atYOffset(getBlocksAtOffset(xOffset, zOffset + i), yOffset);
                explosionBlocks[explosionBlocks.length] = atYOffset(getBlocksAtOffset(xOffset + i, zOffset + i), yOffset);
                explosionBlocks[explosionBlocks.length] = atYOffset(getBlocksAtOffset(xOffset + i, zOffset - i), yOffset);
                explosionBlocks[explosionBlocks.length] = atYOffset(getBlocksAtOffset(xOffset + i, zOffset - i), yOffset + i);
                explosionBlocks[explosionBlocks.length] = atYOffset(getBlocksAtOffset(xOffset + i, zOffset - i), yOffset - i);
                explosionBlocks[explosionBlocks.length] = atYOffset(getBlocksAtOffset(xOffset - i, zOffset - i), yOffset + i);
                explosionBlocks[explosionBlocks.length] = atYOffset(getBlocksAtOffset(xOffset - i, zOffset - i), yOffset - i);
                explosionBlocks[explosionBlocks.length] = atYOffset(getBlocksAtOffset(xOffset, zOffset + i), yOffset + i);
                explosionBlocks[explosionBlocks.length] = atYOffset(getBlocksAtOffset(xOffset + i, zOffset), yOffset + i);
                explosionBlocks[explosionBlocks.length] = atYOffset(getBlocksAtOffset(xOffset, zOffset - i), yOffset + i);
                explosionBlocks[explosionBlocks.length] = atYOffset(getBlocksAtOffset(xOffset - i, zOffset), yOffset + i);
            }

            if (getBlockName(block) === "tnt") {
                breakBlock(block);
                for (var i = 0; i < explosionBlocks.length; i++) {
                    if (explosionBlocks[i] && getBlockName(explosionBlocks[i]) !== "tnt") {
                        try {
                            breakBlock(explosionBlocks[i]);
                        } catch (err) { }
                    }
                }
            }
        }, 2500);

    }

    drawShadows();
    blocksCount += 1;
    setBlocksCount();
}

function getBlockOffsets(block) {
    var xOffset = parseInt(block.getAttribute("data-x-offset"));
    var yOffset = parseInt(block.getAttribute("data-y-offset"));
    var zOffset = parseInt(block.getAttribute("data-z-offset"));

    var response = {
        xOffset: xOffset,
        yOffset: yOffset,
        zOffset: zOffset
    }

    return response;
}

function sortArrayByKey(arr, sortFunc) {
    return arr.sort((a, b) => sortFunc(a) - sortFunc(b));
}

function randomInt(min, max) {
    var result = Math.floor(Math.random() * (max - min)) + min;

    return result;
}

function drawShadows() {
    var blocks = document.getElementsByClassName("block");


    for (var i = 0; i < blocks.length; i++) {
        var blockOffset = getBlockOffsets(blocks[i]);
        var blocksAtOffset = getBlocksAtOffset(blockOffset.xOffset, blockOffset.zOffset);
        var hasBlockAbove = false;
        var blocksAbove = [];

        for (var k = 0; k < blocksAtOffset.length; k++) {
            var currentBlockYOffset = getBlockOffsets(blocksAtOffset[k]).yOffset;

            if (currentBlockYOffset < blockOffset.yOffset) {
                blocksAbove[blocksAbove.length] = blocksAtOffset[k];
                var hasBlockAbove = true;
            }
        }

        var blockTop = blocks[i].getElementsByClassName("top")[0];
        if (hasBlockAbove) {
            sortArrayByKey(blocksAbove, o => getBlockOffsets(o).yOffset);

            var blockAbove = blocksAbove[blocksAbove.length - 1];
            var blockAboveYOffset = Math.abs(getBlockOffsets(blockAbove).yOffset);
            var shadowStrength = (Math.abs(blockAboveYOffset - Math.abs(blockOffset.yOffset))) * 10 * 2.5;

            if (shadowStrength < 100 && getBlockName(blockAbove) !== "glass") {
                blockTop.style.filter = `brightness(${shadowStrength}%)`;
            } else {
                blockTop.style.filter = `brightness(100%)`;
            }
        } else {
            blockTop.style.filter = `brightness(100%)`;
        }
    }

}

function generateWorld() {
    var world = [];

    for (var i = 0; i < worldSize * worldSize; i++) {
        var randomIndex = randomInt(0, 2);

        world[i] = {
            block: availableBlocks[randomIndex]
        }
    }

    renderWorld(world);
}

function breakBlock(block) {
    if (block.classList.contains("block")) {
        if (block.classList.contains("fallingBlock")) {
            block.classList.remove("fallingBlock")
        }

        if (getBlockName(block) === "tnt") {
            block.getElementsByTagName("div")[0].classList.remove("tntBlink")
        }

        removeElement(block);
        drawShadows();
        blocksCount -= 1;
        setBlocksCount();
    }
}

function placeBlock(target) {
    if (target.parentElement.classList.contains("block")) {
        var targetBlock = target.parentElement;

        var targetOffsets = getBlockOffsets(targetBlock);

        var targetXOffset = targetOffsets.xOffset;
        var targetZOffset = targetOffsets.zOffset;
        var targetYOffset = targetOffsets.yOffset;

        var blockContainer = document.createElement("div");
        blockContainer.classList.add("block");

        switch (target.classList[0]) {
            case "left":
                targetXOffset -= 1;

                break;

            case "right":
                targetXOffset += 1;

                break;

            case "bottom":
                targetYOffset += 1;

                break;

            case "top":
                targetYOffset -= 1;

                break;

            case "front":
                targetZOffset += 1;

                break;

            case "back":
                targetZOffset -= 1;

                break;
        }

        var selectedBlock = availableBlocks[selectedBlockIndex];

        createBlock(selectedBlock, targetXOffset, targetYOffset, targetZOffset);
    }
}

const game = _("#game");
const camera = _("#camera");
const fpsContainer = _("#fpsContainer");
const selectedBlockContainer = _("#selectedBlock");
const worldSizeRange = _("#worldSize");
const regenerateWorldButton = _("#regenerateWorld");
const worldSizeSpan = _("#worldSizeSpan");
const spawnTreesCheckBox = _("#spawnTrees");
const sandPhysicsCheckBox = _("#sandPhysics");
const explodingTNTCheckBox = _("#explodingTNT");
const selectedBlockPreview = _("#selectedBlockPreview");
const blocksCountContainer = _("#blocksCount");
const movingMobsCheckBox = _("#movingMobs");

var blocksCount = 0;

const screenWidth = document.body.clientWidth;
const screenHeight = document.body.clientHeight;
var worldSize = worldSizeRange.value;
var selectedBlockIndex = 0;

const availableBlocks = ["grass", "stone", "sand", "brick", "planks", "glass", "leaves", "log", "sandstone", "dirt", "tnt", "slime"];
const sides = ["top", "bottom", "right", "left", "front", "back"];


var xRotation = -5;
var yRotation = 20;

window.addEventListener("keydown", (event) => {

    var offsetTop = parseInt(calcStyle(game).bottom);

    switch (event.key.toLowerCase()) {
        case "w":
            xRotation += 10;

            break;

        case "s":
            xRotation -= 10;

            break;

        case "a":
            yRotation -= 10;

            break;

        case "d":
            yRotation += 10;

            break;

        case "q":
            offsetTop -= 10;

            break;

        case "e":
            offsetTop += 10;

            break;
    }

    game.style.transform = `rotateY(${yRotation}deg) rotateX(${xRotation}deg)`;
    game.style.bottom = `${offsetTop}px`;
});

window.addEventListener("load", () => {
    generateWorld();
    setBlocksCount();

    var selectedBlock = availableBlocks[selectedBlockIndex];
    selectedBlockContainer.innerHTML = `Block: ${selectedBlock} (${selectedBlockIndex})`;
    selectedBlockPreview.src = `img/${selectedBlock}/front.png`;

    if (!navigator.userAgent.includes("Chrome")) {
        alert("Your browser is not supported! Please use Chrome.");
    }
});

window.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    try {
        if (availableBlocks[selectedBlockIndex] === "slime") {
            spawnSlime(event.target);
        } else {
            placeBlock(event.target);
        }
    } catch (err) { }
});

window.addEventListener("wheel", (event) => {
    selectedBlockIndex -= Math.sign(event.deltaY);

    if (selectedBlockIndex > availableBlocks.length - 1) {
        selectedBlockIndex = 0;
    } else if (selectedBlockIndex < 0) {
        selectedBlockIndex = availableBlocks.length - 1;
    }

    var selectedBlock = availableBlocks[selectedBlockIndex];

    selectedBlockContainer.innerHTML = `Block: ${selectedBlock} (${selectedBlockIndex})`;
    selectedBlockPreview.src = `img/${selectedBlock}/front.png`;
});

regenerateWorldButton.addEventListener("click", () => {
    blocksCount = 0;
    game.innerHTML = "";
    generateWorld();
});

worldSizeRange.addEventListener("change", () => {
    worldSize = worldSizeRange.value;
    worldSizeSpan.innerHTML = `World Size (${worldSize})`;
});

var lastDate = Date.now();
requestAnimationFrame(
    function loop() {
        var currentDate = Date.now();
        var fps = Math.round(1000 / (currentDate - lastDate));
        lastDate = currentDate;
        requestAnimationFrame(loop);
        fpsContainer.innerHTML = "FPS: " + fps;
    }
);