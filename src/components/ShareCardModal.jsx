import { useState, useEffect, useRef } from "react";
import { FaTimes, FaDownload, FaShareAlt } from "react-icons/fa";
import Loader from "./Loader";

const getRatingColorHex = (rating) => {
  switch (rating) {
    case "Skip": return "#f472b6"; // Pink-400
    case "Timepass": return "#fbbf24"; // Amber-400
    case "Go for it": return "#34d399"; // Emerald-400
    case "Perfection": return "#c084fc"; // Purple-400
    default: return "#94a3b8"; // Slate-400
  }
};

const getHighResPoster = (url) => {
  if (!url || url === "N/A") return null;
  return url.replace(/_SX\d+\.jpg$/, ".jpg");
};

export default function ShareCardModal({
  item,
  onClose,
  activeProfile,
}) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState("");

  const profileName = activeProfile?.name || "CineTracker";
  const profileAvatar = activeProfile?.avatar || "🍿";

  useEffect(() => {
    const generateCard = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      
      // 1. Draw elegant dark background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#0f172a"); // deep slate-900
      gradient.addColorStop(0.5, "#0b0f19"); // dark blue-950
      gradient.addColorStop(1, "#1e1b4b"); // deep indigo-950
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle decorative ambient circles
      ctx.fillStyle = "rgba(99, 102, 241, 0.08)"; // subtle indigo glow
      ctx.beginPath();
      ctx.arc(canvas.width, 0, 300, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(192, 132, 252, 0.06)"; // subtle purple glow
      ctx.beginPath();
      ctx.arc(0, canvas.height, 400, 0, Math.PI * 2);
      ctx.fill();

      // Border/frame around entire card
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 16;
      ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

      // Helper function to draw right-side texts and signatures
      const drawTextContent = () => {
        // Draw CineTrack Branding top-right
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.font = "bold 20px 'Inter', system-ui, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("CINETRACK Showcase", canvas.width - 60, 60);

        // Draw Movie/Show Title (wrapped)
        ctx.textAlign = "left";
        ctx.fillStyle = "#ffffff";
        ctx.font = "extrabold 48px 'Inter', system-ui, sans-serif";
        
        const titleX = 460;
        let titleY = 110;
        const titleText = item.title;
        const maxTitleWidth = canvas.width - titleX - 60;
        
        // Wrap title
        const titleLines = wrapText(ctx, titleText, titleX, titleY, maxTitleWidth, 54);
        titleY = titleLines + 10;

        // Draw Year/Type label
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "600 20px 'Inter', system-ui, sans-serif";
        const mediaType = item.type ? item.type.toUpperCase() : "MOVIE";
        const watchedYear = item.watchedOn ? new Date(item.watchedOn).getFullYear() : "";
        ctx.fillText(`${mediaType} • ${watchedYear}`, titleX, titleY);
        titleY += 50;

        // Draw Rating Badge
        if (item.rating) {
          const ratingColor = getRatingColorHex(item.rating);
          
          // Badge background
          ctx.fillStyle = ratingColor;
          const badgeText = item.rating.toUpperCase();
          ctx.font = "bold 16px 'Inter', system-ui, sans-serif";
          const badgeWidth = ctx.measureText(badgeText).width + 32;
          const badgeHeight = 34;
          
          // Rounded rect
          drawRoundedRect(ctx, titleX, titleY - 22, badgeWidth, badgeHeight, 8);
          ctx.fill();
          
          // Badge text
          ctx.fillStyle = "#000000";
          if (item.rating === "Perfection" || item.rating === "Skip") {
            ctx.fillStyle = "#ffffff"; // light text on dark purple/pink
          }
          ctx.font = "extrabold 15px 'Inter', system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(badgeText, titleX + (badgeWidth / 2), titleY - 22 + 22);
          titleY += 40;
        }

        // Draw Review Text (wrapped)
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.font = "italic 26px 'Inter', system-ui, sans-serif";
        
        const reviewText = item.review ? `"${item.review}"` : '"No review text recorded yet."';
        const reviewMaxY = canvas.height - 150;
        const maxReviewLines = 4;
        
        // Wrap and draw review body
        wrapText(ctx, reviewText, titleX, titleY + 20, canvas.width - titleX - 80, 36, maxReviewLines);

        // Draw Profile Signature at bottom
        const footerY = canvas.height - 70;
        
        // Draw reviewer avatar circle
        const reviewerColor = getRatingColorHex(item.rating);
        ctx.fillStyle = reviewerColor;
        ctx.beginPath();
        ctx.arc(titleX + 24, footerY - 8, 24, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw emoji inside avatar
        ctx.font = "24px 'Inter', system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(profileAvatar, titleX + 24, footerY);

        // Draw Name details next to avatar
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "500 18px 'Inter', system-ui, sans-serif";
        ctx.fillText("Reviewed by", titleX + 64, footerY - 18);

        ctx.fillStyle = "#ffffff";
        ctx.font = "extrabold 22px 'Inter', system-ui, sans-serif";
        ctx.fillText(profileName, titleX + 64, footerY + 6);
      };

      // Load movie poster image
      if (item.poster && item.poster !== "N/A") {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = getHighResPoster(item.poster);
        img.onload = () => {
          // Poster layout: draw with a clean border/rounded shadow
          const posterWidth = 340;
          const posterHeight = 510;
          const posterX = 60;
          const posterY = 82;

          // Draw a drop shadow effect on poster
          ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
          ctx.shadowBlur = 40;
          ctx.shadowOffsetX = 10;
          ctx.shadowOffsetY = 15;

          // Draw poster with rounded corners (clipping path)
          ctx.save();
          ctx.beginPath();
          drawRoundedRect(ctx, posterX, posterY, posterWidth, posterHeight, 20);
          ctx.clip();
          ctx.drawImage(img, posterX, posterY, posterWidth, posterHeight);
          ctx.restore();

          // Reset shadows
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // Draw text content
          drawTextContent();

          // Finalize URL
          setPreviewUrl(canvas.toDataURL("image/png"));
          setLoading(false);
        };
        img.onerror = () => {
          // CORS fallback block
          drawFallbackPoster(ctx);
          drawTextContent();
          setPreviewUrl(canvas.toDataURL("image/png"));
          setLoading(false);
        };
      } else {
        drawFallbackPoster(ctx);
        drawTextContent();
        setPreviewUrl(canvas.toDataURL("image/png"));
        setLoading(false);
      }
    };

    generateCard();
  }, [item, profileName, profileAvatar]);

  const drawFallbackPoster = (ctx) => {
    const posterWidth = 340;
    const posterHeight = 510;
    const posterX = 60;
    const posterY = 82;

    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, posterX, posterY, posterWidth, posterHeight, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "bold 90px 'Inter', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🎬", posterX + posterWidth / 2, posterY + posterHeight / 2 - 20);

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "bold 20px 'Inter', system-ui, sans-serif";
    ctx.fillText("NO POSTER", posterX + posterWidth / 2, posterY + posterHeight / 2 + 50);
  };

  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const wrapText = (context, text, x, y, maxWidth, lineHeight, maxLines = 10) => {
    const words = text.split(" ");
    let line = "";
    let currentY = y;
    let lineCount = 0;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = context.measureText(testLine);
      let testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        lineCount++;
        if (lineCount >= maxLines) {
          context.fillText(line.trim() + "...", x, currentY);
          return currentY;
        }
        context.fillText(line.trim(), x, currentY);
        line = words[n] + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line.trim(), x, currentY);
    return currentY;
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    const sanitizedTitle = item.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    link.download = `cinetrack_${sanitizedTitle}_review.png`;
    link.href = previewUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in text-white select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl p-6 md:p-8 flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Share Your Review</h3>
            <p className="text-slate-400 text-xs mt-1">Download this beautiful graphic card to share with friends!</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* hidden canvas for drawing */}
        <canvas
          ref={canvasRef}
          width={1200}
          height={675}
          className="hidden"
        />

        {/* Card Preview Area */}
        <div className="w-full flex justify-center items-center relative aspect-[16/9] max-h-[380px] bg-slate-950/60 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader />
              <p className="text-xs text-slate-500 mt-3 animate-pulse">Rendering review canvas...</p>
            </div>
          ) : (
            <img
              src={previewUrl}
              alt="Review Card Preview"
              className="w-full h-full object-contain select-none shadow-2xl"
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="w-full flex gap-3 mt-6 border-t border-slate-800/60 pt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/40 transition-all border border-transparent hover:border-slate-800"
          >
            Cancel
          </button>
          
          <button
            onClick={handleDownload}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 py-3 px-6 text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaDownload /> Download Card Image
          </button>
        </div>

      </div>
    </div>
  );
}
