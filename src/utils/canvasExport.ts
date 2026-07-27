import { StoryCardOptions } from '../types';
import { getGradientById, GRADIENT_OPTIONS } from '../constants/gradients';

export function renderStoryCardCanvas(options: StoryCardOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const width = 1080;
      const height = 1920;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // --- Background: Warm Off-White Editorial Paper ---
      ctx.fillStyle = '#f8f7f4';
      ctx.fillRect(0, 0, width, height);

      // Delicate border around story card frame
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 12;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      // --- Top Header ---
      ctx.textAlign = 'left';

      // Brand Title "tinynote"
      ctx.font = '600 110px "Cormorant Garamond", serif';
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText('tinynote', 80, 160);

      // Subtitle
      ctx.font = 'bold 24px "Space Mono", monospace';
      ctx.fillStyle = 'rgba(26, 26, 26, 0.6)';
      ctx.fillText('REFRACT YOUR DAILY NOTES & GRATITUDE', 80, 205);

      // Meta Strip Divider Line
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(80, 240);
      ctx.lineTo(width - 80, 240);
      ctx.stroke();

      // Meta Info Line
      ctx.font = 'bold 26px "Space Mono", monospace';
      ctx.fillStyle = '#1a1a1a';
      const filledCount = Object.keys(options.entries).length;
      const daysCount = options.daysInMonth || 31;
      const fillPercent = Math.round((filledCount / daysCount) * 100);
      const metaText = `${options.monthName.toUpperCase()} ${options.year} // ${filledCount} DAYS SMILED (${fillPercent}%)`;
      ctx.fillText(metaText, 80, 280);

      // --- 7-Column Calendar Grid ---
      const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const cols = 7;
      const tileWidth = 122;
      const tileHeight = 122;
      const gap = 12;
      const gridWidth = cols * tileWidth + (cols - 1) * gap; // 926px
      const startX = (width - gridWidth) / 2; // 77px
      const headerY = 360;

      // Draw Weekday Labels
      ctx.textAlign = 'center';
      ctx.font = 'bold 22px "Space Mono", monospace';
      ctx.fillStyle = 'rgba(26, 26, 26, 0.6)';
      weekdays.forEach((wd, i) => {
        const x = startX + i * (tileWidth + gap) + tileWidth / 2;
        ctx.fillText(wd, x, headerY);
      });

      const startY = 385;
      const firstDayOffset = options.firstDayOfWeek || 0;
      const todayNum = options.todayDayNumber || daysCount;

      for (let day = 1; day <= daysCount; day++) {
        const gridIndex = (day - 1) + firstDayOffset;
        const col = gridIndex % cols;
        const row = Math.floor(gridIndex / cols);
        const x = startX + col * (tileWidth + gap);
        const y = startY + row * (tileHeight + gap);

        const entry = options.entries[day];
        const isFuture = day > todayNum;
        const formattedNum = day.toString().padStart(2, '0');

        if (entry) {
          // Filled Tile with Gradient
          const gradObj = getGradientById(entry.gradientId);
          const tileGrad = ctx.createLinearGradient(x, y, x + tileWidth, y + tileHeight);
          tileGrad.addColorStop(0, gradObj.canvasColors[0]);
          tileGrad.addColorStop(0.5, gradObj.canvasColors[1]);
          tileGrad.addColorStop(1, gradObj.canvasColors[2]);

          ctx.fillStyle = tileGrad;
          ctx.fillRect(x, y, tileWidth, tileHeight);

          // Tile Border
          ctx.strokeStyle = '#1a1a1a';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, tileWidth, tileHeight);

          // Day Number
          ctx.textAlign = 'left';
          ctx.font = 'bold 20px "Space Mono", monospace';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(formattedNum, x + 8, y + 24);

          // Emoji Badge
          ctx.textAlign = 'center';
          ctx.font = '32px sans-serif';
          ctx.fillText(gradObj.emoji, x + tileWidth / 2, y + tileHeight / 2 + 12);
        } else if (isFuture) {
          // Future Tile
          ctx.fillStyle = '#f8f7f4';
          ctx.fillRect(x, y, tileWidth, tileHeight);

          ctx.strokeStyle = 'rgba(26, 26, 26, 0.12)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, tileWidth, tileHeight);

          ctx.textAlign = 'left';
          ctx.font = 'bold 20px "Space Mono", monospace';
          ctx.fillStyle = 'rgba(26, 26, 26, 0.25)';
          ctx.fillText(formattedNum, x + 8, y + 24);
        } else {
          // Empty Past/Today Tile
          ctx.fillStyle = '#f8f7f4';
          ctx.fillRect(x, y, tileWidth, tileHeight);

          ctx.strokeStyle = 'rgba(26, 26, 26, 0.15)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, tileWidth, tileHeight);

          ctx.textAlign = 'left';
          ctx.font = 'bold 20px "Space Mono", monospace';
          ctx.fillStyle = 'rgba(26, 26, 26, 0.6)';
          ctx.fillText(formattedNum, x + 8, y + 24);
        }
      }

      // --- Featured Monthly Reflection Quote Card ---
      const maxRows = Math.ceil((daysCount + firstDayOffset) / cols);
      const gridBottomY = startY + maxRows * (tileHeight + gap);
      const boxY = Math.max(gridBottomY + 30, 1260);
      const boxWidth = 926;
      const boxHeight = 440;
      const boxX = (width - boxWidth) / 2;

      // Clean White Card Container
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

      // Left Accent Border
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(boxX, boxY, 12, boxHeight);

      // Outer Border
      ctx.strokeStyle = 'rgba(26, 26, 26, 0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      // Header Tag inside Box
      ctx.textAlign = 'left';
      ctx.font = 'bold 22px "Space Mono", monospace';
      ctx.fillStyle = '#6366f1';
      ctx.fillText('PRISM INSIGHTS // FEATURED REFLECTION', boxX + 40, boxY + 55);

      // Quote Text
      const quoteText = options.summaryQuote || getFeaturedQuote(options.entries);
      ctx.font = '300 italic 42px "Cormorant Garamond", serif';
      ctx.fillStyle = '#1a1a1a';

      // Wrap quote text inside box
      const maxWidth = boxWidth - 90;
      const lineHeight = 54;
      const words = quoteText.split(' ');
      let line = '';
      const lines: string[] = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(line.trim());
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line.trim());

      let currentTextY = boxY + 130;
      const maxLinesToDisplay = Math.min(lines.length, 4);
      for (let i = 0; i < maxLinesToDisplay; i++) {
        ctx.fillText(`“${lines[i]}”`, boxX + 40, currentTextY);
        currentTextY += lineHeight;
      }

      // Decorative divider & footer inside quote card
      const cardDividerY = boxY + boxHeight - 70;
      ctx.strokeStyle = 'rgba(26, 26, 26, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(boxX + 40, cardDividerY);
      ctx.lineTo(boxX + boxWidth - 40, cardDividerY);
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.font = 'bold 22px "Space Mono", monospace';
      ctx.fillStyle = 'rgba(26, 26, 26, 0.6)';
      const userTag = options.userName ? `REFRACTED BY ${options.userName.toUpperCase()}` : 'TINYNOTE DAILY GRATITUDE';
      ctx.fillText(userTag, boxX + 40, boxY + boxHeight - 28);

      // --- Canvas Bottom Footer ---
      ctx.textAlign = 'center';
      ctx.font = 'bold 22px "Space Mono", monospace';
      ctx.fillStyle = 'rgba(26, 26, 26, 0.5)';
      ctx.fillText('tinynote • Telegram Mini App', width / 2, height - 60);

      resolve(canvas.toDataURL('image/png'));
    } catch (err) {
      reject(err);
    }
  });
}

function getFeaturedQuote(entries: Record<number, any>): string {
  const entryList = Object.values(entries).filter((e) => e && e.text && e.text.trim().length > 0);
  if (entryList.length > 0) {
    const sorted = [...entryList].sort((a, b) => b.text.length - a.text.length);
    return sorted[0].text;
  }
  return "A quiet space to capture small sparkles of gratitude every single day.";
}
