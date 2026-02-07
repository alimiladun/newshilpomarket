'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Mail, Phone, Building, Calendar, Globe, Users, Edit, Trash2, Plus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export default function AdminBuyersPage() {
  const router = useRouter();
  const [buyers, setBuyers] = useState([]);
  const [filteredBuyers, setFilteredBuyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    companyName: '',
    tradeLicense: '',
    companyType: '',
    industry: '',
    website: '',
    employeeCount: '',
    annualRevenueRange: '',
    address: '',
    isActive: true,
    isVerified: true
  });

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      router.push('/admin/login');
      return;
    }
    
    fetchBuyers();
  }, [router]);

  useEffect(() => {
    filterBuyers();
  }, [searchTerm, buyers]);

  const fetchBuyers = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      console.log('Fetching buyers from:', `${API_BASE_URL}/api/admin/buyers`);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/buyers`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to fetch buyers');
      }

      const data = await response.json();
      console.log('Received data:', data);
      console.log('Buyers count:', data.buyers?.length || 0);
      
      setBuyers(data.buyers || []);
    } catch (error) {
      console.error('Error fetching buyers:', error);
      toast.error('Failed to load buyers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterBuyers = () => {
    let filtered = [...buyers];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.firstName?.toLowerCase().includes(term) ||
        b.lastName?.toLowerCase().includes(term) ||
        b.email?.toLowerCase().includes(term) ||
        b.companyName?.toLowerCase().includes(term) ||
        b.tradeLicense?.toLowerCase().includes(term)
      );
    }

    setFilteredBuyers(filtered);
  };

  const handleCreate = async () => {
    try {
      setProcessingId('creating');
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/buyers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create buyer');
      }

      toast.success('Buyer created successfully');
      setIsCreateModalOpen(false);
      resetForm();
      fetchBuyers();
    } catch (error) {
      console.error('Error creating buyer:', error);
      toast.error(error.message || 'Failed to create buyer');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdate = async () => {
    try {
      setProcessingId(selectedBuyer._id);
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/buyers`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          buyerId: selectedBuyer._id,
          ...formData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update buyer');
      }

      toast.success('Buyer updated successfully');
      setIsEditModalOpen(false);
      setSelectedBuyer(null);
      resetForm();
      fetchBuyers();
    } catch (error) {
      console.error('Error updating buyer:', error);
      toast.error(error.message || 'Failed to update buyer');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async () => {
    try {
      setProcessingId(selectedBuyer._id);
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/buyers?buyerId=${selectedBuyer._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete buyer');
      }

      toast.success('Buyer deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedBuyer(null);
      fetchBuyers();
    } catch (error) {
      console.error('Error deleting buyer:', error);
      toast.error(error.message || 'Failed to delete buyer');
    } finally {
      setProcessingId(null);
    }
  };

  const openEditModal = (buyer) => {
    setSelectedBuyer(buyer);
    setFormData({
      firstName: buyer.firstName || '',
      lastName: buyer.lastName || '',
      email: buyer.email || '',
      phone: buyer.phone || '',
      password: '', // Don't populate password
      companyName: buyer.companyName || '',
      tradeLicense: buyer.tradeLicense || '',
      companyType: buyer.companyType || '',
      industry: buyer.industry || '',
      website: buyer.website || '',
      employeeCount: buyer.employeeCount || '',
      annualRevenueRange: buyer.annualRevenueRange || '',
      address: buyer.address || '',
      isActive: buyer.isActive !== undefined ? buyer.isActive : true,
      isVerified: buyer.isVerified !== undefined ? buyer.isVerified : true
    });
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openDeleteModal = (buyer) => {
    setSelectedBuyer(buyer);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      companyName: '',
      tradeLicense: '',
      companyType: '',
      industry: '',
      website: '',
      employeeCount: '',
      annualRevenueRange: '',
      address: '',
      isActive: true,
      isVerified: true
    });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (buyer) => {
    if (buyer.isActive) {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          Active
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          Inactive
        </Badge>
      );
    }
  };

  const activeCount = buyers.filter(b => b.isActive).length;
  const inactiveCount = buyers.filter(b => !b.isActive).length;

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buyer Management</h1>
            <p className="text-gray-600 mt-2">Manage all buyer accounts</p>
          </div>
          <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Buyer
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Buyers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{buyers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Buyers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Inactive Buyers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{inactiveCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by name, email, company, or license..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Buyers List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading buyers...</p>
          </div>
        ) : filteredBuyers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No buyers found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredBuyers.map((buyer) => (
              <Card key={buyer._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {buyer.firstName} {buyer.lastName}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {buyer.companyName || 'No company name'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(buyer)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(buyer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteModal(buyer)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Contact Information */}
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <p className="text-sm text-gray-600">{buyer.email}</p>
                      </div>
                    </div>

                    {buyer.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Phone</p>
                          <p className="text-sm text-gray-600">{buyer.phone}</p>
                        </div>
                      </div>
                    )}

                    {buyer.tradeLicense && (
                      <div className="flex items-start gap-3">
                        <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Trade License</p>
                          <p className="text-sm text-gray-600">{buyer.tradeLicense}</p>
                        </div>
                      </div>
                    )}

                    {/* Company Details */}
                    {buyer.companyType && (
                      <div className="flex items-start gap-3">
                        <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Company Type</p>
                          <p className="text-sm text-gray-600 capitalize">{buyer.companyType}</p>
                        </div>
                      </div>
                    )}

                    {buyer.industry && (
                      <div className="flex items-start gap-3">
                        <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Industry</p>
                          <p className="text-sm text-gray-600">{buyer.industry}</p>
                        </div>
                      </div>
                    )}

                    {buyer.employeeCount && (
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Employees</p>
                          <p className="text-sm text-gray-600">{buyer.employeeCount}</p>
                        </div>
                      </div>
                    )}

                    {/* Website & Registration */}
                    {buyer.website && (
                      <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Website</p>
                          <a 
                            href={buyer.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {buyer.website}
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Registered</p>
                        <p className="text-sm text-gray-600">{formatDate(buyer.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  {buyer.address && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Address</p>
                      <p className="text-sm text-gray-600">{buyer.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Buyer</DialogTitle>
            <DialogDescription>
              Update buyer information
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleFormChange('firstName', e.target.value)}
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleFormChange('lastName', e.target.value)}
                placeholder="Doe"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                placeholder="+1234567890"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleFormChange('companyName', e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <Label htmlFor="tradeLicense">Trade License</Label>
              <Input
                id="tradeLicense"
                value={formData.tradeLicense}
                onChange={(e) => handleFormChange('tradeLicense', e.target.value)}
                placeholder="TL-12345"
              />
            </div>
            <div>
              <Label htmlFor="companyType">Company Type</Label>
              <Input
                id="companyType"
                value={formData.companyType}
                onChange={(e) => handleFormChange('companyType', e.target.value)}
                placeholder="Private Limited"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleFormChange('industry', e.target.value)}
                placeholder="Retail"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleFormChange('website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
                placeholder="123 Main St, City, Country"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleFormChange('isActive', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isVerified"
                checked={formData.isVerified}
                onChange={(e) => handleFormChange('isVerified', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isVerified" className="cursor-pointer">Verified</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={processingId === selectedBuyer?._id}
            >
              {processingId === selectedBuyer?._id ? 'Updating...' : 'Update Buyer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Buyer</DialogTitle>
            <DialogDescription>
              Add a new buyer to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="create-firstName">First Name *</Label>
              <Input
                id="create-firstName"
                value={formData.firstName}
                onChange={(e) => handleFormChange('firstName', e.target.value)}
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="create-lastName">Last Name *</Label>
              <Input
                id="create-lastName"
                value={formData.lastName}
                onChange={(e) => handleFormChange('lastName', e.target.value)}
                placeholder="Doe"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="create-email">Email *</Label>
              <Input
                id="create-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="create-password">Password *</Label>
              <Input
                id="create-password"
                type="password"
                value={formData.password}
                onChange={(e) => handleFormChange('password', e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="create-phone">Phone</Label>
              <Input
                id="create-phone"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                placeholder="+1234567890"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="create-companyName">Company Name</Label>
              <Input
                id="create-companyName"
                value={formData.companyName}
                onChange={(e) => handleFormChange('companyName', e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <Label htmlFor="create-tradeLicense">Trade License</Label>
              <Input
                id="create-tradeLicense"
                value={formData.tradeLicense}
                onChange={(e) => handleFormChange('tradeLicense', e.target.value)}
                placeholder="TL-12345"
              />
            </div>
            <div>
              <Label htmlFor="create-companyType">Company Type</Label>
              <Input
                id="create-companyType"
                value={formData.companyType}
                onChange={(e) => handleFormChange('companyType', e.target.value)}
                placeholder="Private Limited"
              />
            </div>
            <div>
              <Label htmlFor="create-industry">Industry</Label>
              <Input
                id="create-industry"
                value={formData.industry}
                onChange={(e) => handleFormChange('industry', e.target.value)}
                placeholder="Retail"
              />
            </div>
            <div>
              <Label htmlFor="create-website">Website</Label>
              <Input
                id="create-website"
                value={formData.website}
                onChange={(e) => handleFormChange('website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="create-address">Address</Label>
              <Input
                id="create-address"
                value={formData.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
                placeholder="123 Main St, City, Country"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={processingId === 'creating'}
            >
              {processingId === 'creating' ? 'Creating...' : 'Create Buyer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete buyer {selectedBuyer?.firstName} {selectedBuyer?.lastName}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={processingId === selectedBuyer?._id}
            >
              {processingId === selectedBuyer?._id ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
