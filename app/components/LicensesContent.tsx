"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Check, X } from "lucide-react";
import {
  createLicense,
  getAllLicenses,
  updateLicense,
  deleteLicense,
} from "@/utils/db/actions";
import { usePrivy } from "@privy-io/react-auth";

interface License {
  id: number;
  type: string;
  details: string;
  price: string;
  userId: number | null;
  contentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function LicensesContent() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [newLicense, setNewLicense] = useState({
    type: "",
    details: "",
    price: "",
  });
  const { user } = usePrivy();

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      const fetchedLicenses = await getAllLicenses();
      console.log("licenses", fetchedLicenses);
      setLicenses(fetchedLicenses);
    } catch (error) {
      console.error("Error fetching licenses:", error);
    }
  };

  const handleAddLicense = async () => {
    if (newLicense.type && newLicense.details && newLicense.price) {
      try {
        await createLicense(
          newLicense.type,
          newLicense.details,
          parseFloat(newLicense.price)
        );
        setNewLicense({ type: "", details: "", price: "" });
        fetchLicenses();
      } catch (error) {
        console.error("Error adding license:", error);
      }
    }
  };

  const handleEditLicense = (license: License) => {
    setEditingLicense(license);
    setNewLicense({
      type: license.type,
      details: license.details,
      price: license.price.toString(),
    });
  };

  const handleUpdateLicense = async () => {
    try {
      if (editingLicense) {
        await updateLicense(editingLicense.id, newLicense);
        setEditingLicense(null);
        setNewLicense({ type: "", details: "", price: "" });
        fetchLicenses();
      }
    } catch (error) {
      console.error("Error updating license:", error);
    }
  };

  const handleDeleteLicense = async (id: string) => {
    try {
      await deleteLicense(id);
      fetchLicenses();
    } catch (error) {
      console.error("Error deleting license:", error);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Manage Licenses</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4 mb-6">
          <div>
            <label htmlFor="licenseType" className="block mb-2">
              License Type
            </label>
            <Input
              id="licenseType"
              placeholder="Enter license type"
              value={newLicense.type}
              onChange={(e) =>
                setNewLicense({ ...newLicense, type: e.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor="licenseDetails" className="block mb-2">
              License Details
            </label>
            <Textarea
              id="licenseDetails"
              placeholder="Enter license details"
              value={newLicense.details}
              onChange={(e) =>
                setNewLicense({ ...newLicense, details: e.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor="licensePrice" className="block mb-2">
              License Price (ETH)
            </label>
            <Input
              id="licensePrice"
              type="number"
              step="0.01"
              placeholder="Enter license price"
              value={newLicense.price}
              onChange={(e) =>
                setNewLicense({ ...newLicense, price: e.target.value })
              }
            />
          </div>
          {editingLicense ? (
            <Button type="button" onClick={handleUpdateLicense}>
              Update License
            </Button>
          ) : (
            <Button type="button" onClick={handleAddLicense}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add License
            </Button>
          )}
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>License Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Price (ETH)</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {licenses.map((license) => (
              <TableRow key={license.id}>
                <TableCell>{license.type}</TableCell>
                <TableCell>{license.details}</TableCell>
                <TableCell>{license.price}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditLicense(license)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLicense(license.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
