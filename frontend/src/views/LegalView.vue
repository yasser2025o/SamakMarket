<template>
  <div class="legal-container">
    <h1>Conditions Générales de Vente</h1>
    <!-- L'attribut src pointe directement vers le nom du fichier car il est dans /public -->
    <iframe 
      src="/samakmarket-legal.pdf" 
      width="100%" 
      height="800px" 
      frameborder="0">
    </iframe>
  </div>
</template>

<style scoped>
.legal-container {
  padding: 20px;
  max-width: 1000px;
  margin: auto;
}
iframe {
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
