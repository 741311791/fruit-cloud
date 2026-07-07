'use client'

import { useState } from 'react'
import { Store, Package, IdCard, Building2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SupplierArchive } from './archive/supplier-archive'
import { ProductArchive } from './archive/product-archive'
import { StaffArchive } from './archive/staff-archive'
import { CustomerArchive } from './archive/customer-archive'
import {
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTS,
  INITIAL_STAFF,
  INITIAL_CUSTOMERS,
  type Supplier,
  type Product,
  type Staff,
  type Customer,
} from '@/lib/archive-data'

export function ArchiveManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF)
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">基础档案管理</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          统一框架、差异化字段：集中维护供应商、商品、职员与客户四大主数据。停用后将在业务单据中即时不可选，支持拼音首字母盲打搜索。
        </p>
      </div>

      <Tabs defaultValue="supplier" className="space-y-4">
        <TabsList>
          <TabsTrigger value="supplier" className="gap-1.5">
            <Store className="size-4" />
            供应商档案
          </TabsTrigger>
          <TabsTrigger value="product" className="gap-1.5">
            <Package className="size-4" />
            商品档案
          </TabsTrigger>
          <TabsTrigger value="staff" className="gap-1.5">
            <IdCard className="size-4" />
            职员档案
          </TabsTrigger>
          <TabsTrigger value="customer" className="gap-1.5">
            <Building2 className="size-4" />
            客户档案
          </TabsTrigger>
        </TabsList>

        <TabsContent value="supplier">
          <SupplierArchive suppliers={suppliers} setSuppliers={setSuppliers} />
        </TabsContent>
        <TabsContent value="product">
          <ProductArchive products={products} setProducts={setProducts} />
        </TabsContent>
        <TabsContent value="staff">
          <StaffArchive staff={staff} setStaff={setStaff} />
        </TabsContent>
        <TabsContent value="customer">
          <CustomerArchive customers={customers} setCustomers={setCustomers} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
