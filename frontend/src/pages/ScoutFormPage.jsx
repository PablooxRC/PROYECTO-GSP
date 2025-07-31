import React, { useState, useEffect } from 'react';
import { Card, Input, Textscout, Label, Button } from '../components/ui';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useScout } from "../context/scoutContex.jsx";

function ScoutFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();
  const navigate = useNavigate();
  const { createScout, loadScout, errors: ScoutErrors, updateScout, setErrors } = useScout();
  const params = useParams();

  const onSubmit = handleSubmit(async (data) => {
    setErrors([]); 
    let scout;
    if (!params.ci) {
      scout = await createScout(data);
    } else {
      scout = await updateScout(params.ci, data);
    }
    if (scout) {
      navigate("/scouts");
    }
  });

  useEffect(() => {
    setErrors([]); // limpiar errores al entrar al formulario
    if (params.ci) {
      loadScout(params.ci).then((scout) => {
        setValue("ci", scout.ci);
        setValue("nombre", scout.nombre);
        setValue("apellido", scout.apellido);
        setValue("unidad", scout.unidad);
        setValue("rama", scout.rama);
        setValue("etapa", scout.etapa);
        
      });
    }
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "ci") {
        setErrors([]);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <div className="h-[calc(100vh-64px)] flex justify-center items-center">
      <Card>
        {ScoutErrors.map((error, i) => (
          <p className="text-red-500" key={i}>{error}</p>
        ))}
        <h2>{params.ci ? "Editar Scout" : "Registrar Scout"}</h2>
        <form onSubmit={onSubmit}>
          <Label htmlFor="ci">Carnet de identidad</Label>
          <Input
            placeholder="Ingresa el CI"
            {...register('ci', {
              required: true,
              valueAsNumber: true,
            })}
          />
          {errors.ci && <p className="text-red-500">El ci es requerido</p>}

          {/* el resto del formulario como ya lo tienes */}
          <Label htmlFor="nombre">Nombre</Label>
          <Input placeholder="Ingresa el nombre" {...register('nombre', { required: true })} />
          {errors.nombre && <p className="text-red-500">El nombre es requerido</p>}

          <Label htmlFor="apellido">Apellido</Label>
          <Input placeholder="Ingresa el apellido" {...register('apellido', { required: true })} />
          {errors.apellido && <p className="text-red-500">El apellido es requerido</p>}

          <Label htmlFor="unidad">Unidad</Label>
          <Input placeholder="Ingresa la unidad" {...register('unidad', { required: true })} />
          {errors.unidad && <p className="text-red-500">La unidad es requerida</p>}

          <Label htmlFor="rama">Rama</Label>
          <Input placeholder="Ingresa la rama" {...register('rama', { required: true })} />
          {errors.rama && <p className="text-red-500">La rama es requerida</p>}

          <Label htmlFor="etapa">Etapa</Label>
          <Input placeholder="Ingresa la etapa" {...register('etapa', { required: true })} />
          {errors.etapa && <p className="text-red-500">La etapa es requerida</p>}

          <Button>{params.ci ? "Editar Scout" : "Registrar Scout"}</Button>
        </form>
      </Card>
    </div>
  );
}

export default ScoutFormPage;
