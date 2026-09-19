'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderArchive,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  FileCode2,
  BookOpen,
  Wrench,
  ShieldCheck,
  Shield,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
  Tag,
  Check,
  Download,
  Edit2,
  Trash2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { Modal } from '@/components/ui/Modal';

const SOP_CATEGORIES = [
  { id: 'ALL', name: 'All Categories' },
  { id: 'PRINTING', name: '3D Printing Protocols' },
  { id: 'CALIBRATION', name: 'Machine Calibration' },
  { id: 'QUALITY', name: 'Quality & Inspection' },
  { id: 'MAINTENANCE', name: 'Hardware Maintenance' },
  { id: 'PACKAGING', name: 'Packaging & Dispatch' },
  { id: 'SAFETY', name: 'Workshop Safety & Solvents' },
  { id: 'OPERATIONS', name: 'Operations & Workflow' },
];

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<'SOPS' | 'CAD_DOCS'>('SOPS');
  const [sops, setSops] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [isAddSopOpen, setIsAddSopOpen] = useState(false);
  const [isEditSopOpen, setIsEditSopOpen] = useState(false);
  const [selectedSop, setSelectedSop] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [isEditDocOpen, setIsEditDocOpen] = useState(false);

  // Forms
  const [newSopForm, setNewSopForm] = useState({
    title: 'Textured PEI Bed Cleaning & Degreasing Protocol',
    category: 'PRINTING',
    purpose: 'Eliminate fingertip oils and residues to ensure zero corner warping on high-shrinkage polymers.',
    scope: 'All FDM print operators prior to starting any build plate job.',
    procedureSteps: `1. Remove build plate and wash with warm water and liquid dish soap (Dawn/Fairy).
2. Dry thoroughly with clean lint-free microfiber towel.
3. Place plate back on magnetic heatbed.
4. Spray 99.9% Isopropyl Alcohol (IPA) across entire printable surface.
5. Wipe in linear strokes with clean Kimwipe/microfiber.
6. Do NOT touch build area with bare fingers after IPA wipe.`,
    requiredTools: '99.9% IPA spray bottle, Lint-free microfiber cloths, Dish soap',
    parameters: 'Bed temp during wipe: <40°C | Clean frequency: Every print',
    qualityCriteria: 'Zero visible watermarks or grease smears. Water contact angle > 60°.',
    revision: '1',
    owner: 'PrintXO Quality Lead',
  });

  const [editSopForm, setEditSopForm] = useState({
    id: '',
    title: '',
    category: 'PRINTING',
    purpose: '',
    scope: '',
    procedureSteps: '',
    requiredTools: '',
    parameters: '',
    qualityCriteria: '',
    revision: '1',
    owner: '',
    approvalStatus: 'APPROVED',
  });

  const [newDocForm, setNewDocForm] = useState({
    title: '',
    category: 'CAD',
    fileType: 'STEP',
    fileSize: '4200000',
    uploadedBy: 'PrintXO Engineer',
  });

  const [editDocForm, setEditDocForm] = useState({
    id: '',
    title: '',
    category: 'CAD',
    uploadedBy: 'PrintXO Engineer',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [sopRes, docRes] = await Promise.all([
        fetch(`/api/sops?category=${categoryFilter}`),
        fetch('/api/documents'),
      ]);

      if (sopRes.ok) setSops(await sopRes.json());
      if (docRes.ok) setDocuments(await docRes.json());
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const handleCreateSop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSopForm),
      });
      if (res.ok) {
        setIsAddSopOpen(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditSop = (sop: any) => {
    setEditSopForm({
      id: sop.id,
      title: sop.title || '',
      category: sop.category || 'PRINTING',
      purpose: sop.purpose || '',
      scope: sop.scope || '',
      procedureSteps: sop.procedureSteps || '',
      requiredTools: sop.requiredTools || '',
      parameters: sop.parameters || '',
      qualityCriteria: sop.qualityCriteria || '',
      revision: String(sop.revision ?? 1),
      owner: sop.owner || '',
      approvalStatus: sop.approvalStatus || 'APPROVED',
    });
    setIsEditSopOpen(true);
  };

  const handleUpdateSop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/sops/${editSopForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSopForm),
      });
      if (res.ok) {
        setIsEditSopOpen(false);
        if (selectedSop?.id === editSopForm.id) {
          setSelectedSop({ ...selectedSop, ...editSopForm });
        }
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update SOP');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating SOP');
    }
  };

  const handleDeleteSop = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Standard Operating Procedure?')) return;
    try {
      const res = await fetch(`/api/sops/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedSop?.id === id) {
          setIsDetailModalOpen(false);
          setSelectedSop(null);
        }
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete SOP');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting SOP');
    }
  };

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDocForm),
      });
      if (res.ok) {
        setIsAddDocOpen(false);
        setNewDocForm({
          title: '',
          category: 'CAD',
          fileType: 'STEP',
          fileSize: '4200000',
          uploadedBy: 'PrintXO Engineer',
        });
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create document');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating document');
    }
  };

  const handleOpenEditDoc = (doc: any) => {
    setEditDocForm({
      id: doc.id,
      title: doc.title || doc.name || '',
      category: doc.category || doc.type || 'CAD',
      uploadedBy: doc.uploadedBy || 'PrintXO Engineer',
    });
    setIsEditDocOpen(true);
  };

  const handleUpdateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/documents/${editDocForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDocForm),
      });
      if (res.ok) {
        setIsEditDocOpen(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update document');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating document');
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Are you sure you want to delete this CAD document?')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete document');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting document');
    }
  };

  // Filtered SOPs
  const filteredSops = sops.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.sopCode.toLowerCase().includes(q) ||
      s.title.toLowerCase().includes(q) ||
      s.purpose.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q);
    return matchesSearch;
  });

  // KPIs
  const totalSops = sops.length;
  const approvedSops = sops.filter((s) => s.approvalStatus === 'APPROVED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--accent-red)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Operations & Knowledge Base
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Sections 32 & 33: Standard Operating Procedures
            </span>
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: 4,
            }}
          >
            Documents & SOP Knowledge Base
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Standard Operating Procedures (SOPs), engineering process guidelines, workshop safety manuals, and technical CAD records.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setIsAddSopOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              backgroundColor: 'var(--accent-red)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 10px var(--accent-red-glow)',
            }}
          >
            <Plus size={16} />
            Publish New SOP
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <KPICard
          label="Total Operating SOPs"
          value={totalSops}
          subtext="Standard operating procedures"
          icon={BookOpen}
        />
        <KPICard
          label="Approved Standards"
          value={approvedSops}
          subtext="Mandatory workshop protocols"
          icon={CheckCircle2}
        />
        <KPICard
          label="CAD / Technical Files"
          value={documents.length + 4}
          subtext="STEP, STL, & drawing drawings"
          icon={FileCode2}
        />
        <KPICard
          label="Standardization Index"
          value="100%"
          subtext="Process coverage across farm"
          icon={ShieldCheck}
        />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          gap: 24,
        }}
      >
        <button
          onClick={() => setActiveTab('SOPS')}
          style={{
            padding: '12px 0',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'SOPS' ? 'var(--accent-red)' : 'transparent'}`,
            color: activeTab === 'SOPS' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <BookOpen size={16} />
          Standard Operating Procedures (SOPs)
        </button>

        <button
          onClick={() => setActiveTab('CAD_DOCS')}
          style={{
            padding: '12px 0',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'CAD_DOCS' ? 'var(--accent-red)' : 'transparent'}`,
            color: activeTab === 'CAD_DOCS' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <FileCode2 size={16} />
          CAD Registry & Technical Drawings
        </button>
      </div>

      {/* TAB 1: SOPS */}
      {activeTab === 'SOPS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filter and Search Bar */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 12px',
                  width: '100%',
                  maxWidth: 360,
                }}
              >
                <Search size={16} color="var(--text-tertiary)" />
                <input
                  type="text"
                  placeholder="Search SOP code, title, procedure..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Filter size={15} color="var(--text-tertiary)" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    padding: '6px 10px',
                    outline: 'none',
                  }}
                >
                  {SOP_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Showing {filteredSops.length} procedures
            </div>
          </div>

          {/* SOP Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: 16,
            }}
          >
            {loading ? (
              <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                Loading knowledge base...
              </div>
            ) : filteredSops.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                No SOPs found matching filter.
              </div>
            ) : (
              filteredSops.map((sop) => (
                <div
                  key={sop.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: 12,
                            color: 'var(--accent-red)',
                          }}
                        >
                          {sop.sopCode}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          Rev {sop.revision || 1}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                        {sop.title}
                      </h3>
                    </div>

                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        backgroundColor: 'var(--bg-surface-elevated)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {sop.category}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Purpose
                    </span>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                      {sop.purpose}
                    </p>
                  </div>

                  {sop.requiredTools && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Required Tools: </strong>
                      {sop.requiredTools}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: 10,
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      Owner: {sop.owner}
                    </span>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        title="Edit SOP"
                        onClick={() => handleOpenEditSop(sop)}
                        style={{
                          padding: '6px 8px',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 4,
                          fontSize: 12,
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        title="Delete SOP"
                        onClick={() => handleDeleteSop(sop.id)}
                        style={{
                          padding: '6px 8px',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 4,
                          fontSize: 12,
                          color: 'var(--accent-red)',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSop(sop);
                          setIsDetailModalOpen(true);
                        }}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 4,
                          fontSize: 12,
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Read Full SOP →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CAD & DRAWINGS REGISTRY */}
      {activeTab === 'CAD_DOCS' && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Section 25: Engineering CAD & Technical Drawings
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                Authoritative revision-controlled STEP solids, STL surface meshes, and inspection blueprint drawings.
              </p>
            </div>

            <button
              onClick={() => setIsAddDocOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                backgroundColor: 'var(--accent-red)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={15} />
              Register CAD Document
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
            {documents.length > 0
              ? documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: 'var(--accent-red)' }}>
                        {doc.fileType || 'CAD'}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: 'var(--bg-surface-elevated)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {doc.category || 'CAD'}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {doc.title}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                      <span>By: {doc.uploadedBy || 'Engineer'}</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, paddingTop: 8, borderTop: '1px solid var(--border-subtle)', marginTop: 4 }}>
                      <button
                        title="Edit Document"
                        onClick={() => handleOpenEditDoc(doc)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 4,
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        title="Delete Document"
                        onClick={() => handleDeleteDoc(doc.id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 4,
                          color: 'var(--accent-red)',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              : [
                  { code: 'CAD-ARM-V1.2', name: 'Quadcopter Arm (PRX-AERO-ARM-V1)', type: 'STEP Solid', size: '4.2 MB', rev: 'v1.2', date: '12 Sep 2026' },
                  { code: 'STL-ARM-0.16', name: 'Slicer Mesh - 0.16mm Layer Optimized', type: '3MF Mesh', size: '12.8 MB', rev: 'v1.2', date: '12 Sep 2026' },
                  { code: 'CAD-BRK-V2.0', name: 'Robotics Dual Bracket (PRX-ROBO-BRK-V2)', type: 'STEP Solid', size: '2.8 MB', rev: 'v2.0', date: '10 Sep 2026' },
                  { code: 'DRW-TOL-001', name: 'Mounting Flange GD&T Blueprint', type: 'PDF Drawing', size: '1.1 MB', rev: 'v1.0', date: '08 Sep 2026' },
                ].map((doc) => (
                  <div
                    key={doc.code}
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: 'var(--accent-red)' }}>
                        {doc.code}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: 'var(--bg-surface-elevated)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {doc.type}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {doc.name}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                      <span>Revision {doc.rev} • {doc.size}</span>
                      <span>{doc.date}</span>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* DETAIL MODAL: VIEW FULL SOP */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`${selectedSop?.sopCode}: ${selectedSop?.title}`}
      >
        {selectedSop && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                backgroundColor: 'var(--bg-canvas)',
                padding: 12,
                borderRadius: 4,
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Category</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedSop.category}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Revision & Approval</span>
                <div style={{ fontWeight: 600, color: 'var(--accent-green, #10b981)' }}>
                  Rev {selectedSop.revision || 1} • {selectedSop.approvalStatus}
                </div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Operational Scope
              </span>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                {selectedSop.scope || 'All workshop technicians.'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Step-by-Step Procedure
              </span>
              <div
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  padding: 14,
                  borderRadius: 4,
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  marginTop: 4,
                }}
              >
                {selectedSop.procedureSteps}
              </div>
            </div>

            {selectedSop.parameters && (
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Critical Process Parameters
                </span>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {selectedSop.parameters}
                </p>
              </div>
            )}

            {selectedSop.qualityCriteria && (
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Acceptance Quality Criteria
                </span>
                <p style={{ fontSize: 13, color: 'var(--accent-green, #10b981)', fontWeight: 600, marginTop: 2 }}>
                  {selectedSop.qualityCriteria}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <button
                type="button"
                onClick={() => handleDeleteSop(selectedSop.id)}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 4,
                  color: 'var(--accent-red)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <Trash2 size={13} />
                Delete SOP
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenEditSop(selectedSop);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 4,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <Edit2 size={13} />
                  Edit SOP
                </button>

                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  style={{
                    padding: '8px 18px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 4,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE SOP MODAL */}
      <Modal
        isOpen={isAddSopOpen}
        onClose={() => setIsAddSopOpen(false)}
        title="Publish Standard Operating Procedure (SOP)"
      >
        <form onSubmit={handleCreateSop} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              SOP Title
            </label>
            <input
              type="text"
              required
              value={newSopForm.title}
              onChange={(e) => setNewSopForm({ ...newSopForm, title: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Category
              </label>
              <select
                value={newSopForm.category}
                onChange={(e) => setNewSopForm({ ...newSopForm, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                {SOP_CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Owner / Author
              </label>
              <input
                type="text"
                required
                value={newSopForm.owner}
                onChange={(e) => setNewSopForm({ ...newSopForm, owner: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Operational Purpose
            </label>
            <input
              type="text"
              required
              value={newSopForm.purpose}
              onChange={(e) => setNewSopForm({ ...newSopForm, purpose: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Step-by-Step Procedure Steps
            </label>
            <textarea
              rows={4}
              required
              value={newSopForm.procedureSteps}
              onChange={(e) => setNewSopForm({ ...newSopForm, procedureSteps: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Required Tools
              </label>
              <input
                type="text"
                value={newSopForm.requiredTools}
                onChange={(e) => setNewSopForm({ ...newSopForm, requiredTools: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Quality Acceptance Criteria
              </label>
              <input
                type="text"
                value={newSopForm.qualityCriteria}
                onChange={(e) => setNewSopForm({ ...newSopForm, qualityCriteria: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setIsAddSopOpen(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 18px',
                backgroundColor: 'var(--accent-red)',
                border: 'none',
                borderRadius: 4,
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Publish SOP
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT SOP MODAL */}
      <Modal
        isOpen={isEditSopOpen}
        onClose={() => setIsEditSopOpen(false)}
        title="Edit Standard Operating Procedure"
      >
        <form onSubmit={handleUpdateSop} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              SOP Title
            </label>
            <input
              type="text"
              required
              value={editSopForm.title}
              onChange={(e) => setEditSopForm({ ...editSopForm, title: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Category
              </label>
              <select
                value={editSopForm.category}
                onChange={(e) => setEditSopForm({ ...editSopForm, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                {SOP_CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Revision
              </label>
              <input
                type="text"
                value={editSopForm.revision}
                onChange={(e) => setEditSopForm({ ...editSopForm, revision: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Approval Status
              </label>
              <select
                value={editSopForm.approvalStatus}
                onChange={(e) => setEditSopForm({ ...editSopForm, approvalStatus: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="APPROVED">APPROVED</option>
                <option value="DRAFT">DRAFT</option>
                <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Purpose & Objective
            </label>
            <textarea
              rows={2}
              value={editSopForm.purpose}
              onChange={(e) => setEditSopForm({ ...editSopForm, purpose: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
                resize: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Step-by-Step Procedure Instructions
            </label>
            <textarea
              rows={5}
              value={editSopForm.procedureSteps}
              onChange={(e) => setEditSopForm({ ...editSopForm, procedureSteps: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Required Tools
              </label>
              <input
                type="text"
                value={editSopForm.requiredTools}
                onChange={(e) => setEditSopForm({ ...editSopForm, requiredTools: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Quality Acceptance Criteria
              </label>
              <input
                type="text"
                value={editSopForm.qualityCriteria}
                onChange={(e) => setEditSopForm({ ...editSopForm, qualityCriteria: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <button
              type="button"
              onClick={() => {
                setIsEditSopOpen(false);
                handleDeleteSop(editSopForm.id);
              }}
              style={{
                padding: '8px 14px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 4,
                color: 'var(--accent-red)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Trash2 size={14} />
              Delete SOP
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsEditSopOpen(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 18px',
                  backgroundColor: 'var(--accent-red)',
                  border: 'none',
                  borderRadius: 4,
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ADD CAD DOCUMENT MODAL */}
      <Modal
        isOpen={isAddDocOpen}
        onClose={() => setIsAddDocOpen(false)}
        title="Register CAD / Engineering Drawing"
      >
        <form onSubmit={handleCreateDoc} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Document / Model Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Quadcopter Drone Arm V2"
              value={newDocForm.title}
              onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                File Type
              </label>
              <select
                value={newDocForm.fileType}
                onChange={(e) => setNewDocForm({ ...newDocForm, fileType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="STEP">STEP Solid (.step/.stp)</option>
                <option value="STL">STL Mesh (.stl)</option>
                <option value="3MF">3MF Project (.3mf)</option>
                <option value="PDF">PDF Engineering Drawing (.pdf)</option>
                <option value="DXF">DXF Flat Pattern (.dxf)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Category
              </label>
              <select
                value={newDocForm.category}
                onChange={(e) => setNewDocForm({ ...newDocForm, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="CAD">CAD 3D Models</option>
                <option value="DRAWINGS">2D Technical Drawings</option>
                <option value="SLICER">Slicer 3MF Projects</option>
                <option value="SPEC_SHEETS">Datasheets & Specs</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Uploaded / Maintained By
            </label>
            <input
              type="text"
              value={newDocForm.uploadedBy}
              onChange={(e) => setNewDocForm({ ...newDocForm, uploadedBy: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setIsAddDocOpen(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 18px',
                backgroundColor: 'var(--accent-red)',
                border: 'none',
                borderRadius: 4,
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Register Document
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT CAD DOCUMENT MODAL */}
      <Modal
        isOpen={isEditDocOpen}
        onClose={() => setIsEditDocOpen(false)}
        title="Edit CAD Document Record"
      >
        <form onSubmit={handleUpdateDoc} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Document Title
            </label>
            <input
              type="text"
              required
              value={editDocForm.title}
              onChange={(e) => setEditDocForm({ ...editDocForm, title: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Category
              </label>
              <select
                value={editDocForm.category}
                onChange={(e) => setEditDocForm({ ...editDocForm, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="CAD">CAD 3D Models</option>
                <option value="DRAWINGS">2D Technical Drawings</option>
                <option value="SLICER">Slicer 3MF Projects</option>
                <option value="SPEC_SHEETS">Datasheets & Specs</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Maintained By
              </label>
              <input
                type="text"
                value={editDocForm.uploadedBy}
                onChange={(e) => setEditDocForm({ ...editDocForm, uploadedBy: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <button
              type="button"
              onClick={() => {
                setIsEditDocOpen(false);
                handleDeleteDoc(editDocForm.id);
              }}
              style={{
                padding: '8px 14px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 4,
                color: 'var(--accent-red)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Trash2 size={14} />
              Delete Document
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsEditDocOpen(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 18px',
                  backgroundColor: 'var(--accent-red)',
                  border: 'none',
                  borderRadius: 4,
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
