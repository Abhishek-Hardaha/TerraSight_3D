"use client";

import React, { useState } from "react";
import { X, Box, Sparkles, Download, Layers } from "lucide-react";

interface SampleModelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (glbUrl: string, name: string, previewUrl?: string) => void;
}

const PRESET_MODELS = [
  { id: "01", name: "Modern Living Room Sofa", glb: "01_living_room_sofa.glb", img: "01_living_room_sofa_side_by_side.png", cat: "Living Room Furniture", verts: "14,846", faces: "29,680" },
  { id: "02", name: "Hardwood Coffee Table", glb: "02_hardwood_coffee_table.glb", img: "02_hardwood_coffee_table_side_by_side.png", cat: "Living Room Furniture", verts: "9,794", faces: "19,556" },
  { id: "03", name: "Living Room Lounge Armchair", glb: "03_lounge_armchair.glb", img: "03_lounge_armchair_side_by_side.png", cat: "Living Room Furniture", verts: "7,389", faces: "14,822" },
  { id: "04", name: "Potted Ficus Houseplant", glb: "04_potted_houseplant.glb", img: "04_potted_houseplant_side_by_side.png", cat: "Home Botanical", verts: "28,645", faces: "57,395" },
  { id: "05", name: "Living Room Accent Cushion", glb: "05_accent_cushion.glb", img: "05_accent_cushion_side_by_side.png", cat: "Soft Furnishings", verts: "5,399", faces: "10,766" },
  { id: "06", name: "Velvet Pouf Ottoman", glb: "06_velvet_pouf_ottoman.glb", img: "06_velvet_pouf_ottoman_side_by_side.png", cat: "Modern Decor", verts: "22,441", faces: "44,894" },
  { id: "07", name: "Modern Velvet Armchair", glb: "07_velvet_accent_armchair.glb", img: "07_velvet_accent_armchair_side_by_side.png", cat: "Modern Decor", verts: "14,579", faces: "29,150" },
  { id: "08", name: "Round Wooden Accent Table", glb: "08_round_accent_table.glb", img: "08_round_accent_table_side_by_side.png", cat: "Modern Decor", verts: "5,077", faces: "10,233" },
  { id: "09", name: "Glazed Ceramic Table Vase", glb: "09_ceramic_vase.glb", img: "09_ceramic_vase_side_by_side.png", cat: "Pottery & Decor", verts: "9,037", faces: "17,846" },
  { id: "10", name: "Workstation Monitors & Tech", glb: "10_workstation_monitors.glb", img: "10_workstation_monitors_side_by_side.png", cat: "Computer Hardware", verts: "10,910", faces: "21,818" },
  { id: "11", name: "Programmer Computer Desk", glb: "11_computer_workstation_desk.glb", img: "11_computer_workstation_desk_side_by_side.png", cat: "Office Furniture", verts: "13,806", faces: "27,766" },
  { id: "12", name: "Ergonomic Swivel Task Chair", glb: "12_ergonomic_office_chair.glb", img: "12_ergonomic_office_chair_side_by_side.png", cat: "Office Furniture", verts: "8,886", faces: "17,648" },
  { id: "13", name: "Heavy Duty Cardboard Box", glb: "13_packaging_cardboard_box.glb", img: "13_packaging_cardboard_box_side_by_side.png", cat: "Storage Packaging", verts: "27,962", faces: "55,916" },
  { id: "14", name: "Kids Wooden Writing Desk", glb: "14_kids_study_desk.glb", img: "14_kids_study_desk_side_by_side.png", cat: "Kids Furniture", verts: "38,030", faces: "76,104" },
  { id: "15", name: "Toy Storage Organizer Crate", glb: "15_toy_storage_crate.glb", img: "15_toy_storage_crate_side_by_side.png", cat: "Kids Furniture", verts: "18,464", faces: "37,010" },
  { id: "16", name: "Wall Bookshelf Display Unit", glb: "16_wall_bookshelf.glb", img: "16_wall_bookshelf_side_by_side.png", cat: "Kids Furniture", verts: "23,601", faces: "47,276" },
  { id: "17", name: "Boho Woven Rattan Armchair", glb: "17_wicker_armchair.glb", img: "17_wicker_armchair_side_by_side.png", cat: "Living Room Furniture", verts: "15,767", faces: "31,526" },
  { id: "18", name: "Wooden Shape Sorter Toy", glb: "18_wooden_shape_sorter.glb", img: "18_wooden_shape_sorter_side_by_side.png", cat: "Kids Toys", verts: "24,771", faces: "49,534" },
  { id: "19", name: "Playroom Storage Caddy", glb: "19_storage_canvas_bin.glb", img: "19_storage_canvas_bin_side_by_side.png", cat: "Storage", verts: "8,841", faces: "17,670" },
  { id: "20", name: "Modern Floor Standing Lamp", glb: "20_floor_lamp.glb", img: "20_floor_lamp_side_by_side.png", cat: "Decor", verts: "12,906", faces: "25,804" },
  { id: "21", name: "Wall Canvas Art Frame", glb: "21_picture_frame.glb", img: "21_picture_frame_side_by_side.png", cat: "Decor", verts: "5,254", faces: "10,504" },
  { id: "22", name: "Designer Geometric Area Rug", glb: "22_living_room_rug.glb", img: "22_living_room_rug_side_by_side.png", cat: "Decor", verts: "10,899", faces: "21,786" },
  { id: "23", name: "Curved Contemporary Sofa", glb: "23_curved_velvet_sofa.glb", img: "23_curved_velvet_sofa_side_by_side.png", cat: "Living Room Furniture", verts: "12,716", faces: "25,424" },
  { id: "24", name: "Mid-Century Modern Low Table", glb: "24_designer_coffee_table.glb", img: "24_designer_coffee_table_side_by_side.png", cat: "Living Room Furniture", verts: "7,198", faces: "14,396" },
  { id: "25", name: "Ceramic Ambient Luminaire", glb: "25_table_lamp_luminaire.glb", img: "25_table_lamp_luminaire_side_by_side.png", cat: "Decor", verts: "16,777", faces: "33,546" },
  { id: "26", name: "Abstract Interior Sculpture", glb: "26_sculptural_art_decor.glb", img: "26_sculptural_art_decor_side_by_side.png", cat: "Decor", verts: "5,772", faces: "11,472" },
];

export default function SampleModelsModal({ isOpen, onClose, onSelectModel }: SampleModelsModalProps) {
  const [filterCat, setFilterCat] = useState<string>("all");

  if (!isOpen) return null;

  const filtered = filterCat === "all"
    ? PRESET_MODELS
    : PRESET_MODELS.filter(m => m.cat.toLowerCase().includes(filterCat.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-5xl w-full max-h-[90vh] p-6 shadow-2xl relative flex flex-col gap-5 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Daily Objects Reconstructions Portfolio (26 Models)
              </h3>
              <p className="text-xs text-slate-400">
                Full 3D Watertight Models reconstructed with Meta SAM 3D Objects
              </p>
            </div>
          </div>

          <div className="flex gap-1.5 text-xs font-semibold pr-8">
            {["all", "Living Room", "Decor", "Office", "Kids"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  filterCat === cat ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white bg-slate-950/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of 16 Models */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto pr-1 max-h-[62vh]">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectModel(`/presets/${item.glb}`, item.name, `/presets/${item.img}`);
                onClose();
              }}
              className="group bg-slate-950/70 hover:bg-slate-800/80 border border-white/10 hover:border-sky-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 shadow-lg flex flex-col"
            >
              <div className="w-full h-32 bg-black relative overflow-hidden">
                <img
                  src={`/presets/${item.img}`}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-2 left-2 bg-black/75 px-1.5 py-0.5 rounded text-[10px] font-mono text-sky-400 font-bold border border-white/10">
                  #{item.id}
                </span>
                <span className="absolute bottom-2 right-2 bg-black/75 px-1.5 py-0.5 rounded text-[9px] text-slate-300 font-mono">
                  {item.verts} v
                </span>
              </div>
              <div className="p-3.5 flex flex-col gap-1">
                <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{item.cat}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
