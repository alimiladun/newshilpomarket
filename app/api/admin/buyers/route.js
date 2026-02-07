import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Buyer from '@/models/Buyer';
import bcrypt from 'bcryptjs';

// GET - Fetch all buyers
export async function GET(request) {
  try {
    console.log('Admin buyers GET API called');
    await connectDB();
    console.log('Database connected');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    let query = {};
    
    // Add search functionality
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    console.log('Fetching buyers with query:', query);
    const buyers = await Buyer.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .lean();
    console.log(`Found ${buyers.length} buyers`);

    return NextResponse.json(
      {
        success: true,
        buyers,
        total: buyers.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get buyers error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error'
      },
      { status: 500 }
    );
  }
}

// POST - Create a new buyer
export async function POST(request) {
  try {
    console.log('Admin buyers POST API called');
    await connectDB();
    
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone,
      companyName,
      tradeLicense,
      companyType,
      industry,
      website,
      employeeCount,
      annualRevenueRange,
      address
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please provide all required fields (firstName, lastName, email, password)'
        },
        { status: 400 }
      );
    }

    // Check if buyer already exists
    const existingBuyer = await Buyer.findOne({ email: email.toLowerCase() });
    if (existingBuyer) {
      return NextResponse.json(
        {
          success: false,
          message: 'Buyer with this email already exists'
        },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new buyer
    const newBuyer = await Buyer.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      companyName,
      tradeLicense,
      companyType,
      industry,
      website,
      employeeCount,
      annualRevenueRange,
      address,
      isActive: true,
      isVerified: true
    });

    // Remove password from response
    const buyerResponse = newBuyer.toObject();
    delete buyerResponse.password;
    delete buyerResponse.refreshToken;

    console.log('Buyer created successfully:', buyerResponse._id);

    return NextResponse.json(
      {
        success: true,
        message: 'Buyer created successfully',
        buyer: buyerResponse
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create buyer error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update buyer
export async function PUT(request) {
  try {
    console.log('Admin buyers PUT API called');
    await connectDB();
    
    const body = await request.json();
    const { 
      buyerId,
      firstName, 
      lastName, 
      email, 
      phone,
      companyName,
      tradeLicense,
      companyType,
      industry,
      website,
      employeeCount,
      annualRevenueRange,
      address,
      isActive,
      isVerified
    } = body;

    if (!buyerId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Buyer ID is required'
        },
        { status: 400 }
      );
    }

    // Find buyer
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return NextResponse.json(
        {
          success: false,
          message: 'Buyer not found'
        },
        { status: 404 }
      );
    }

    // Check if email is being changed to an existing email
    if (email && email !== buyer.email) {
      const existingBuyer = await Buyer.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: buyerId }
      });
      if (existingBuyer) {
        return NextResponse.json(
          {
            success: false,
            message: 'Email already in use by another buyer'
          },
          { status: 400 }
        );
      }
    }

    // Update fields
    if (firstName) buyer.firstName = firstName;
    if (lastName) buyer.lastName = lastName;
    if (email) buyer.email = email.toLowerCase();
    if (phone !== undefined) buyer.phone = phone;
    if (companyName !== undefined) buyer.companyName = companyName;
    if (tradeLicense !== undefined) buyer.tradeLicense = tradeLicense;
    if (companyType !== undefined) buyer.companyType = companyType;
    if (industry !== undefined) buyer.industry = industry;
    if (website !== undefined) buyer.website = website;
    if (employeeCount !== undefined) buyer.employeeCount = employeeCount;
    if (annualRevenueRange !== undefined) buyer.annualRevenueRange = annualRevenueRange;
    if (address !== undefined) buyer.address = address;
    if (isActive !== undefined) buyer.isActive = isActive;
    if (isVerified !== undefined) buyer.isVerified = isVerified;

    await buyer.save();

    // Remove sensitive data from response
    const buyerResponse = buyer.toObject();
    delete buyerResponse.password;
    delete buyerResponse.refreshToken;

    console.log('Buyer updated successfully:', buyerResponse._id);

    return NextResponse.json(
      {
        success: true,
        message: 'Buyer updated successfully',
        buyer: buyerResponse
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update buyer error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete buyer
export async function DELETE(request) {
  try {
    console.log('Admin buyers DELETE API called');
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');

    if (!buyerId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Buyer ID is required'
        },
        { status: 400 }
      );
    }

    // Find and delete buyer
    const buyer = await Buyer.findByIdAndDelete(buyerId);
    if (!buyer) {
      return NextResponse.json(
        {
          success: false,
          message: 'Buyer not found'
        },
        { status: 404 }
      );
    }

    console.log('Buyer deleted successfully:', buyerId);

    return NextResponse.json(
      {
        success: true,
        message: 'Buyer deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete buyer error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error'
      },
      { status: 500 }
    );
  }
}
