"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ConceptGraphProps {
  title: string;
  relatedLinks: string[];
}

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isCenter?: boolean;
}

interface Link {
  source: string;
  target: string;
}

export default function ConceptGraph({ title, relatedLinks }: ConceptGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateSize();

    // Create nodes
    const centerNode: Node = {
      id: "center",
      label: title,
      x: canvas.width / (2 * window.devicePixelRatio),
      y: canvas.height / (2 * window.devicePixelRatio),
      vx: 0,
      vy: 0,
      isCenter: true,
    };

    const nodes: Node[] = [centerNode];
    const links: Link[] = [];

    relatedLinks.slice(0, 10).forEach((link, i) => {
      const angle = (i / relatedLinks.slice(0, 10).length) * Math.PI * 2;
      const radius = 150;
      
      nodes.push({
        id: `node-${i}`,
        label: link,
        x: centerNode.x + Math.cos(angle) * radius,
        y: centerNode.y + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      });

      links.push({
        source: "center",
        target: `node-${i}`,
      });
    });

    // Physics simulation
    const simulate = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Apply forces
      nodes.forEach((node) => {
        if (node.isCenter) return;

        // Spring force towards center
        const dx = centerNode.x - node.x;
        const dy = centerNode.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const targetDistance = 120;
        const force = (distance - targetDistance) * 0.01;

        node.vx += (dx / distance) * force;
        node.vy += (dy / distance) * force;

        // Repulsion from other nodes
        nodes.forEach((other) => {
          if (other === node) return;
          const dx2 = other.x - node.x;
          const dy2 = other.y - node.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (dist2 < 80) {
            node.vx -= (dx2 / dist2) * 0.5;
            node.vy -= (dy2 / dist2) * 0.5;
          }
        });

        // Damping
        node.vx *= 0.9;
        node.vy *= 0.9;

        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Boundary constraints
        node.x = Math.max(60, Math.min(width - 60, node.x));
        node.y = Math.max(40, Math.min(height - 40, node.y));
      });
    };

    // Render
    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, width, height);

      // Draw links
      ctx.strokeStyle = "#6b7280";
      ctx.lineWidth = 2;
      links.forEach((link) => {
        const source = nodes.find((n) => n.id === link.source);
        const target = nodes.find((n) => n.id === link.target);
        if (!source || !target) return;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach((node) => {
        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.isCenter ? 40 : 30, 0, Math.PI * 2);
        ctx.fillStyle = node.isCenter ? "#0066CC" : "#4D94FF";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Label
        ctx.fillStyle = "#ffffff";
        ctx.font = node.isCenter ? "bold 12px sans-serif" : "11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        const maxWidth = node.isCenter ? 70 : 50;
        const label = node.label.length > 15 ? node.label.slice(0, 15) + "..." : node.label;
        ctx.fillText(label, node.x, node.y);
      });
    };

    // Animation loop
    const animate = () => {
      simulate();
      render();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [title, relatedLinks]);

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Interactive Concept Map</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Explore how <strong>{title}</strong> connects to related topics. The central node represents your search topic,
          and connected nodes show related Wikipedia articles.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-[500px] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full"
          />
        </motion.div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-2">Related Topics ({relatedLinks.length})</h4>
        <div className="flex flex-wrap gap-2">
          {relatedLinks.slice(0, 10).map((link, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm"
            >
              {link}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}