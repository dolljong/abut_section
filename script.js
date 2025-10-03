document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('abutmentCanvas');
    const ctx = canvas.getContext('2d');
    const drawButton = document.getElementById('drawButton');

    const inputs = {
        breastWallThickness: document.getElementById('breastWallThickness'),
        breastWallHeight: document.getElementById('breastWallHeight'),
        wallThickness: document.getElementById('wallThickness'),
        wallHeight: document.getElementById('wallHeight'),
        foundationThickness: document.getElementById('foundationThickness'),
        frontToeLength: document.getElementById('frontToeLength'),
        backHeelLength: document.getElementById('backHeelLength'),
    };

    function drawAbutment() {
        // --- 1. Get and Parse Input Values ---
        const dims = {};
        for (const key in inputs) {
            const value = parseFloat(inputs[key].value);
            if (isNaN(value) || value < 0) {
                alert(`"${inputs[key].id}"에 유효한 양수를 입력해주세요.`);
                return;
            }
            dims[key] = value;
        }

        if (dims.breastWallThickness > dims.wallThickness) {
            alert("흉벽두께는 벽체두께보다 클 수 없습니다.");
            return;
        }

        // --- 2. Calculate Scale and Centering ---
        const totalWidth = dims.frontToeLength + dims.wallThickness + dims.backHeelLength;
        const totalHeight = dims.foundationThickness + dims.wallHeight + dims.breastWallHeight;

        const padding = 50; // Canvas padding in pixels
        const canvasContentWidth = canvas.width - 2 * padding;
        const canvasContentHeight = canvas.height - 2 * padding;

        const scale = Math.min(canvasContentWidth / totalWidth, canvasContentHeight / totalHeight);

        // Scaled dimensions object
        const s = {};
        for (const key in dims) {
            s[key] = dims[key] * scale;
        }
        const sTotalWidth = totalWidth * scale;
        const sTotalHeight = totalHeight * scale;

        // Offset to center the drawing
        const offsetX = (canvas.width - sTotalWidth) / 2;
        const offsetY = (canvas.height - sTotalHeight) / 2;

        // --- 3. Define Polygon Coordinates ---
        // Defines the vertices of the abutment polygon in clockwise order, starting from the bottom-left.
        const p = [
            // P0: Bottom-left of foundation
            { x: offsetX, y: offsetY + sTotalHeight },
            // P1: Bottom-right of foundation
            { x: offsetX + sTotalWidth, y: offsetY + sTotalHeight },
            // P2: Top-right of foundation (at back heel)
            { x: offsetX + sTotalWidth, y: offsetY + s.breastWallHeight + s.wallHeight },
            // P3: Wall base back
            { x: offsetX + s.frontToeLength + s.wallThickness, y: offsetY + s.breastWallHeight + s.wallHeight },
            // P4: Wall top back (and breast wall bottom back)
            { x: offsetX + s.frontToeLength + s.wallThickness, y: offsetY + s.breastWallHeight },
            // P5: Breast wall top back
            { x: offsetX + s.frontToeLength + s.wallThickness, y: offsetY },
            // P6: Breast wall top front
            { x: offsetX + s.frontToeLength + s.wallThickness - s.breastWallThickness, y: offsetY },
            // P7: Breast wall bottom front
            { x: offsetX + s.frontToeLength + s.wallThickness - s.breastWallThickness, y: offsetY + s.breastWallHeight },
            // P8: Wall top front
            { x: offsetX + s.frontToeLength, y: offsetY + s.breastWallHeight },
            // P9: Wall base front
            { x: offsetX + s.frontToeLength, y: offsetY + s.breastWallHeight + s.wallHeight },
            // P10: Foundation top front (at front toe)
            { x: offsetX, y: offsetY + s.breastWallHeight + s.wallHeight },
        ];

        // --- 4. Draw on Canvas ---
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#f0f0f0';

        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        for (let i = 1; i < p.length; i++) {
            ctx.lineTo(p[i].x, p[i].y);
        }
        ctx.closePath();

        ctx.fill();
        ctx.stroke();
    }

    drawButton.addEventListener('click', drawAbutment);

    // Initial draw on page load
    drawAbutment();
});